import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videoReactionRouter } from "@/modules/video-reaction/server/procedures";
import { videosViewRouter } from "@/modules/video-view/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videosView: videosViewRouter,
  videoReaction: videoReactionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
