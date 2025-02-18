import { db } from "@/db";
import { videoReaction } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoReactionLike] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.userId, userId),
            eq(videoReaction.type, "like")
          )
        );
      if (existingVideoReactionLike) {
        const [deleteViewersReaction] = await db
          .delete(videoReaction)
          .where(
            and(
              eq(videoReaction.userId, userId),
              eq(videoReaction.videoId, videoId)
            )
          )
          .returning();
        return deleteViewersReaction;
      }

      const [createdVideoReaction] = await db
        .insert(videoReaction)
        .values({
          videoId,
          userId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [videoReaction.userId, videoReaction.videoId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createdVideoReaction;
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoReactionDislike] = await db
        .select()
        .from(videoReaction)
        .where(
          and(
            eq(videoReaction.videoId, videoId),
            eq(videoReaction.userId, userId),
            eq(videoReaction.type, "dislike")
          )
        );
      if (existingVideoReactionDislike) {
        const [deleteViewersReaction] = await db
          .delete(videoReaction)
          .where(
            and(
              eq(videoReaction.userId, userId),
              eq(videoReaction.videoId, videoId)
            )
          )
          .returning();
        return deleteViewersReaction;
      }

      const [createdVideoReaction] = await db
        .insert(videoReaction)
        .values({
          videoId,
          userId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [videoReaction.userId, videoReaction.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning();

      return createdVideoReaction;
    }),
});
