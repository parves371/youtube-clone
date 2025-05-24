import { db } from "@/db";
import {
  comments,
  users,
  videoReaction,
  videos,
  videosViews
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";
export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;
      const { id } = input;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userID)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return video;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userID } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(videos),
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          commentsCount: db.$count(comments, eq(comments.videoId, videos.id)),
          likesCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          user: users,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.userId, userID),
            cursor
              ? or(
                  lt(videos.updateAt, cursor.updateAt),
                  and(
                    eq(videos.updateAt, cursor.updateAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updateAt), desc(videos.id))
        // add 1 to the limit to check if there is more data
        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to  the last item if  there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updateAt: lastItem.updateAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
