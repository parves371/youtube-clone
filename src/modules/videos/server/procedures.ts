import { db } from "@/db";
import {
  subcriptions,
  users,
  videoReaction,
  videos,
  videosViews,
  videoUpdateSchema,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
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
      const { cursor, limit, categoryId } = input;

      const data = await db
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

        .where(
          and(
            eq(videos.visibility, "public"),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) {
        userId = user.id;
      }

      const ViewerReaction = db.$with("viwer_reactions").as(
        db
          .select({
            videoId: videoReaction.videoId,
            type: videoReaction.type,
          })
          .from(videoReaction)
          .where(inArray(videoReaction.userId, userId ? [userId] : []))
      );
      const viewerSubcriptions = db.$with("viewer_subcriptions").as(
        db
          .select()
          .from(subcriptions)
          .where(inArray(subcriptions.viewerId, userId ? [userId] : []))
      );

      const [existingVideo] = await db
        .with(ViewerReaction, viewerSubcriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subcriberCount: db.$count(
              subcriptions,
              eq(subcriptions.creatorId, users.id)
            ),
            viewerSubcribed: isNotNull(viewerSubcriptions.viewerId).mapWith(
              Boolean
            ),
          },
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReaction,
            and(
              eq(videoReaction.videoId, videos.id),
              eq(videoReaction.type, "dislike")
            )
          ),
          viwerReaction: ViewerReaction.type,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(ViewerReaction, eq(ViewerReaction.videoId, videos.id))
        .leftJoin(
          viewerSubcriptions,
          eq(viewerSubcriptions.creatorId, users.id)
        )
        .where(eq(videos.id, input.id))
        .limit(1);
      // .groupBy(videos.id, users.id, ViewerReaction.type);

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingVideo;
    }),

  genrateThumbail: protectedProcedure
    .input(z.object({ id: z.string().uuid(), prompt: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env
          .UPSTASH_WORKFLOW_URL!}/api/videos/workflows/thumbnail`,
        body: { userID, videoId: input.id, prompt: input.prompt },
        retries: 3,
      });

      return workflowRunId;
    }),
  genrateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env
          .UPSTASH_WORKFLOW_URL!}/api/videos/workflows/description`,
        body: { userID, videoId: input.id },
        retries: 3,
      });

      return workflowRunId;
    }),
  genrateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL!}/api/videos/workflows/title`,
        body: { userID, videoId: input.id },
        retries: 3,
      });

      return workflowRunId;
    }),

  revalidate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!existingVideo.muxUploadId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const directUpload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );

      if (!directUpload.status || !directUpload.asset_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      // TODO: Protentially find a way to revalidate tractId and tractStatus as well

      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: asset.playback_ids?.[0].id,
          muxAssetId: asset.id,
          duration: duration,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)))
        .returning();

      return updatedVideo;
    }),
  restoreThumbail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;

      const [exitingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)));
      if (!exitingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (exitingVideo.thumbnailKey) {
        const utiapi = new UTApi();
        await utiapi.deleteFiles(exitingVideo.thumbnailKey);

        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userID)));
      }

      if (!exitingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const tempThumbnailUrl = `https://image.mux.com/${exitingVideo.muxPlaybackId}/thumbnail.jpg`;
      const utiapi = new UTApi();

      const uploadedThumbnail = await utiapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)))
        .returning();

      return updatedVideo;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;
      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)))
        .returning();

      if (!removedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return removedVideo;
    }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userID } = ctx.user;

      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updateAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userID)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return updatedVideo;
    }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId.toString(),
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*", // TODO: Remove this in production
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Unttile",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return {
      video,
      url: upload.url,
    };
  }),
});
