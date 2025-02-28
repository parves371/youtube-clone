import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, content } = input;
      const { id: userId } = ctx.user;

      const [comment] = await db
        .insert(comments)
        .values({
          videoId,
          userId,
          content,
        })
        .returning();

      return comment;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [deleetdComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!deleetdComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      return deleetdComment;
    }),
  getMany: baseProcedure
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
      const { clerkUserId } = ctx;
      const { videoId, cursor, limit } = input;

      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viwer-reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const [totalData, data] = await Promise.all([
        db
          .select({
            count: count(),
          })
          .from(comments)
          .where(and(eq(comments.videoId, videoId))),
        db
          .with(viewerReactions)
          .select({
            ...getTableColumns(comments),
            user: users,
            viewerReactions: viewerReactions.type,
            likeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "like"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "dislike"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId),
              cursor
                ? or(
                    lt(comments.updateAt, cursor.updateAt),
                    and(
                      eq(comments.updateAt, cursor.updateAt),
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(users, eq(comments.userId, users.id))
          .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
          .orderBy(desc(comments.updateAt), desc(comments.id))
          .limit(limit + 1),
      ]);

      const hasMore = data.length > limit;
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // set the next cursor to  the last item if  there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updateAt: lastItem.updateAt }
        : null;

      return {
        totalCount: totalData[0].count,
        items,
        nextCursor,
      };
    }),
});
