import { useMemo } from "react";
import { VideoGetOneOutPut } from "../../types";
import { VideoDescription } from "./video-description";
import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reaction";
import { formatDistanceToNow, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
  video: VideoGetOneOutPut;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <Skeleton className="h-8 w-full" />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <Skeleton className="h-9 w-48 rounded-full" />

        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <Skeleton className="h-9 w-12 rounded-full" />
          <Skeleton className="h-9 w-12 rounded-full" />
          <Skeleton className="h-9 w-10 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-24 w-full" />
    </div>
  );
};

// prooerly implement video reactionF
export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
      video.viewCount
    );
  }, [video.viewCount]);
  const expandedViews = useMemo(() => {
    return new Intl.NumberFormat("en-US", { notation: "standard" }).format(
      video.viewCount
    );
  }, [video.viewCount]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createAt, { addSuffix: true });
  }, [video.createAt]);
  const expandedDate = useMemo(() => {
    return format(video.createAt, "MMMM d, yyyy");
  }, [video.createAt]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold ">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex  overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislike={video.dislikeCount}
            viewerReaction={video.viwerReaction}
          />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};
