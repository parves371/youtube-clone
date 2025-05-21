import { db } from "@/db";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { users, videoReaction, videos, videosViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const PlaylistRouter = createTRPCRouter({
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const viewerVideoReatcion = db.$with("viewer_video_reaction").as(
        db
          .select({
            videoId: videoReaction.videoId,
            likedAt: videoReaction.updateAt,
          })
          .from(videoReaction)
          .where(
            and(
              eq(videoReaction.userId, userId),
              eq(videoReaction.type, "like")
            )
          )
      );

      const data = await db
        .with(viewerVideoReatcion)
        .select({
          ...getTableColumns(videos),
          user: users,
          likedAt: viewerVideoReatcion.likedAt,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          viewerVideoReatcion,
          eq(videos.id, viewerVideoReatcion.videoId)
        )

        .where(
          and(
            eq(videos.visibility, "public"),
            // check if the cursor is defined and add the condition to the where clause
            cursor
              ? or(
                  lt(viewerVideoReatcion.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReatcion.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReatcion.likedAt), desc(videos.id))
        // add 1 to the limit to check if there is more data

        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to  the last item if  there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, likedAt: lastItem.likedAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videosViews.videoId,
            viewedAt: videosViews.updateAt,
          })
          .from(videosViews)
          .where(eq(videosViews.userId, userId))
      );

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          user: users,
          viewedAt: viewerVideoViews.viewedAt,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikecount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))

        .where(
          and(
            eq(videos.visibility, "public"),
            // check if the cursor is defined and add the condition to the where clause
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        // add 1 to the limit to check if there is more data

        .limit(limit + 1);

      const hasMore = data.length > limit;
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to  the last item if  there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
