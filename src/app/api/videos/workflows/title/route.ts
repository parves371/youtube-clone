import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InitialStepParams {
  userID: string;
  videoId: string;
}
export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InitialStepParams;
  const { userID, videoId } = input;

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

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ title: "update title from background job" })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
