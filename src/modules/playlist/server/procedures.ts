import { db } from "@/db";
import {
  playlist,
  playlistVideos,
  users,
  videoReaction,
  videos,
  videosViews,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { z } from "zod";

export const PlaylistRouter = createTRPCRouter({
  revove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [deletedPlaylist] = await db
        .delete(playlist)
        .where(and(eq(playlist.id, id), eq(playlist.userId, userId)))
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedPlaylist;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { id } = input;
      const [existingPlaylist] = await db
        .select()
        .from(playlist)
        .where(and(eq(playlist.id, id), eq(playlist.userId, userId)));
      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingPlaylist;
    }),

  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const [existingPlaylist] = await db
        .select()
        .from(playlist)
        .where(
          and(eq(playlist.id, input.playlistId), eq(playlist.userId, userId))
        );

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { cursor, limit, playlistId } = input;

      const videosFromPlaylist = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: playlistVideos.videoId,
          })
          .from(playlistVideos)
          .where(eq(playlistVideos.playlistId, playlistId))
      );

      const data = await db
        .with(videosFromPlaylist)
        .select({
          ...getTableColumns(videos),
          user: users,

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
          videosFromPlaylist,
          eq(videos.id, videosFromPlaylist.videoId)
        )

        .where(
          and(
            eq(videos.visibility, "public"),
            // check if the cursor is defined and add the condition to the where clause
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

  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [existingPlaylist] = await db
        .select()
        .from(playlist)
        .where(eq(playlist.id, playlistId));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      return deletedPlaylistVideo;
    }),
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [existingPlaylist] = await db
        .select()
        .from(playlist)
        .where(eq(playlist.id, playlistId));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      return createdPlaylistVideo;
    }),

  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit, videoId } = input;

      const data = await db
        .select({
          ...getTableColumns(playlist),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlist.id)
          ),
          user: users,
          containsVideo: videoId
            ? sql<boolean>`(
                          SELECT EXISTS(
                            SELECT 1
                            FROM ${playlistVideos} pv
                            WHERE pv.playlist_id = ${playlist.id} AND pv.video_id = ${videoId}
                                          )
                                        )`
            : sql<boolean>`false`,
        })
        .from(playlist)
        .innerJoin(users, eq(playlist.userId, users.id))

        .where(
          and(
            eq(playlist.userId, userId),
            cursor
              ? or(
                  lt(playlist.updateAt, cursor.updateAt),
                  and(
                    eq(playlist.updateAt, cursor.updateAt),
                    lt(playlist.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlist.updateAt), desc(playlist.id))
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
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlist),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlist.id)
          ),
          user: users,
          thumbnailUrl: sql<string | null>`(
            SELECT v.thumbnail_url
            FROM ${playlistVideos} pv
            JOIN ${videos} v ON pv.video_id = v.id
            WHERE pv.playlist_id = ${playlist.id}
            ORDER BY pv.update_at DESC
            LIMIT 1



            )
          `,
        })
        .from(playlist)
        .innerJoin(users, eq(playlist.userId, users.id))

        .where(
          and(
            eq(playlist.userId, userId),
            cursor
              ? or(
                  lt(playlist.updateAt, cursor.updateAt),
                  and(
                    eq(playlist.updateAt, cursor.updateAt),
                    lt(playlist.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlist.updateAt), desc(playlist.id))
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

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { name } = input;

      const [createdPlaylist] = await db
        .insert(playlist)
        .values({
          name,
          userId,
        })
        .returning();

      if (!createdPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return createdPlaylist;
    }),

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
