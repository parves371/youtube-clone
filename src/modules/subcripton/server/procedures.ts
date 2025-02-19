import { db } from "@/db";
import { subcriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
});
