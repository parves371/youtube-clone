import { categoriesRouter } from "@/modules/categories/server/procedures";
import { commentReactionRouter } from "@/modules/comment-reaction/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { PlaylistRouter } from "@/modules/playlist/server/procedures";
import { searchRouter } from "@/modules/search/ui/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subcriptionsRouter } from "@/modules/subcripton/server/procedures";
import { suggestionRouter } from "@/modules/suggestions/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures";
import { videoReactionRouter } from "@/modules/video-reaction/server/procedures";
import { videosViewRouter } from "@/modules/video-view/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  users: usersRouter,
  studio: studioRouter,
  videos: videosRouter,
  search: searchRouter,
  comments: commentsRouter,
  playlist: PlaylistRouter,
  categories: categoriesRouter,
  videosView: videosViewRouter,
  suggestions: suggestionRouter,
  subcriptions: subcriptionsRouter,
  videoReaction: videoReactionRouter,
  commentReactions: commentReactionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
