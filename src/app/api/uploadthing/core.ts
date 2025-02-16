import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
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

      console.log({ dbuser });
      if (!dbuser) throw new UploadThingError("Unauthorized");

      return { user: dbuser, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      db.update(videos)
        .set({ thumbnailUrl: file.url })
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
