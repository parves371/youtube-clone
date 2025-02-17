import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
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
