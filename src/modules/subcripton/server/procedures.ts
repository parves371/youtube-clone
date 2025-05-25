import { db } from "@/db";
import { subcriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const subcriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't subscribe to yourself",
        });
      }

      const [creatingSubcription] = await db
        .insert(subcriptions)
        .values({
          viewerId: ctx.user.id,
          creatorId: userId,
        })
        .returning();

      return creatingSubcription;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't subscribe to yourself",
        });
      }

      const [deletedSubcription] = await db
        .delete(subcriptions)
        .where(
          and(
            eq(subcriptions.viewerId, ctx.user.id),
            eq(subcriptions.creatorId, userId)
          )
        )
        .returning();

      return deletedSubcription;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string().uuid(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(subcriptions),
          user: {
            ...getTableColumns(users),
            subcriberCount: db.$count(
              subcriptions,
              eq(subcriptions.creatorId, users.id)
            ),
          },
        })
        .from(subcriptions)
        .innerJoin(users, eq(subcriptions.creatorId, users.id))

        .where(
          and(
            eq(subcriptions.viewerId, userId),
            cursor
              ? or(
                  lt(subcriptions.updateAt, cursor.updateAt),
                  and(
                    eq(subcriptions.updateAt, cursor.updateAt),
                    lt(subcriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(subcriptions.updateAt), desc(subcriptions.creatorId))
        // add 1 to the limit to check if there is more data

        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to  the last item if  there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { creatorId: lastItem.creatorId, updateAt: lastItem.updateAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
