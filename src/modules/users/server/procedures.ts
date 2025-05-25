import { db } from "@/db";
import { subcriptions, users, videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
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

      const viewerSubcriptions = db.$with("viewer_subcriptions").as(
        db
          .select()
          .from(subcriptions)
          .where(inArray(subcriptions.viewerId, userId ? [userId] : []))
      );

      const [existingUser] = await db
        .with(viewerSubcriptions)
        .select({
          ...getTableColumns(users),
          viewerSubcribed: isNotNull(viewerSubcriptions.viewerId).mapWith(
            Boolean
          ),
          videocount: db.$count(videos, eq(videos.userId, users.id)),
          subcriptionCount: db.$count(
            subcriptions,
            eq(subcriptions.creatorId, users.id)
          ),
        })
        .from(users)
        .leftJoin(
          viewerSubcriptions,
          eq(viewerSubcriptions.creatorId, users.id)
        )
        .where(eq(users.id, input.id))
        .limit(1);

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingUser;
    }),
});
