import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  BannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: ClerkUserID } = await auth();

      if (!ClerkUserID) throw new UploadThingError("Unauthorized");
      const [dbuser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, ClerkUserID));

      if (!dbuser) throw new UploadThingError("Unauthorized");

      if (dbuser.bannerKey) {
        const utiapi = new UTApi();
        await utiapi.deleteFiles(dbuser.bannerKey);

        await db
          .update(users)
          .set({ bannerKey: null, bannerUrl: null })
          .where(and(eq(users.id, dbuser.id)));
      }

      return { userId: dbuser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      db.update(users)
        .set({ bannerUrl: file.url, bannerKey: file.key })
        .where(and(eq(users.id, metadata.userId)))
        .execute();

      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string() }))
    .middleware(async ({ input }) => {
      const { userId: ClerkUserID } = await auth();
      console.log({ ClerkUserID });

      if (!ClerkUserID) throw new UploadThingError("Unauthorized");
      const [dbuser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, ClerkUserID));

      if (!dbuser) throw new UploadThingError("Unauthorized");
      const [exitingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, dbuser.id)));

      if (!exitingVideo) throw new UploadThingError("not found");
      if (exitingVideo.thumbnailKey) {
        const utiapi = new UTApi();
        await utiapi.deleteFiles(exitingVideo.thumbnailKey);

        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(
            and(eq(videos.id, input.videoId), eq(videos.userId, dbuser.id))
          );
      }

      return { user: dbuser, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      db.update(videos)
        .set({ thumbnailUrl: file.url, thumbnailKey: file.key })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        )
        .execute();

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
