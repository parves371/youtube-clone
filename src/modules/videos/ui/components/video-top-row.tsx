import { useMemo } from "react";
import { VideoGetOneOutPut } from "../../types";
import { VideoDescription } from "./video-description";
import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reaction";
import { formatDistanceToNow, format } from "date-fns";

interface VideoTopRowProps {
  video: VideoGetOneOutPut;
}
// prooerly implement video reactionF
export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(1000);
  }, []);
  const expandedViews = useMemo(() => {
    return new Intl.NumberFormat("en-US", { notation: "standard" }).format(
      1000
    );
  }, []);
  
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
          <VideoReactions />
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
