import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InitialStepParams {
  userID: string;
  videoId: string;
  prompt: string;
}
export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InitialStepParams;
  const { userID, videoId, prompt } = input;
  const utiapi = new UTApi();

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userID)));

    if (!existingVideo) {
      throw new Error("Video not found");
    }
    return existingVideo;
  });

  const { body } = await context.call<{ data: Array<{ url: string }> }>(
    "generate-thumbnail",
    {
      url: `https://api.openai.com/v1/images/generations`,
      method: "POST",
      body: {
        prompt,
        n: 1,
        model: "dall-e-3",
        size: "1792x1024",
      },
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const tempThumbnail = body.data[0].url;
  if (!tempThumbnail) {
    throw new Error("Bad request");
  }
  await context.run("cleanup-thumbnail", async () => {
    if (video.thumbnailKey) {
      await utiapi.deleteFiles(video.thumbnailKey);
      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userID)));
    }
  });

  const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
    const uploadedThumbnail = await utiapi.uploadFilesFromUrl(tempThumbnail);
    if (!uploadedThumbnail.data) {
      throw new Error("Bad request");
    }
    return uploadedThumbnail.data;
  });

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploadedThumbnail.key,
        thumbnailUrl: uploadedThumbnail.url,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
