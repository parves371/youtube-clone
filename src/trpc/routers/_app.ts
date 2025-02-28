import { categoriesRouter } from "@/modules/categories/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subcriptionsRouter } from "@/modules/subcripton/server/procedures";
import { videoReactionRouter } from "@/modules/video-reaction/server/procedures";
import { videosViewRouter } from "@/modules/video-view/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";
import { commentReactionRouter } from "@/modules/comment-reaction/server/procedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videosView: videosViewRouter,
  videoReaction: videoReactionRouter,
  subcriptions: subcriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
