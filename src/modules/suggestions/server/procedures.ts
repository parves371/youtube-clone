import { db } from "@/db";
import { users, videoReaction, videos, videosViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";
export const suggestionRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        vedioId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { vedioId, cursor, limit } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, vedioId));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, vedioId)),
          likecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, vedioId),
              eq(videoReaction.type, "like")
            )
          ),
          dislikecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, vedioId),
              eq(videoReaction.type, "dislike")
            )
          ),
        })
        .from(videos)
        .where(
          and(
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
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
        .innerJoin(users, eq(videos.userId, users.id))
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
