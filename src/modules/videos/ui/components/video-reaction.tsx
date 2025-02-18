import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { VideoGetOneOutPut } from "../../types";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislike: number;
  viewerReaction: VideoGetOneOutPut["viwerReaction"];
}

export const VideoReactions = ({
  dislike,
  likes,
  viewerReaction,
  videoId,
}: VideoReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const like = trpc.videoReaction.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      // TODO:Invaliadte "Liked" playlist
    },
    onError: (errror) => {
      toast.error("Something went wrong");
      if (errror.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const disliked = trpc.videoReaction.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      // TODO:Invaliadte "disloke" playlist
    },
    onError: (errror) => {
      toast.error("Something went wrong");
      if (errror.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div className="flex items-center flex-none ">
      <Button
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        variant={"secondary"}
        onClick={() => {
          like.mutate({ videoId });
        }}
        disabled={like.isPending || disliked.isPending}
      >
        <ThumbsUpIcon
          className={cn("w-5 h-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" />
      <Button
        className="rounded-l-none rounded-r-full gap-2 pl-3"
        variant={"secondary"}
        onClick={() => {
          disliked.mutate({ videoId });
        }}
        disabled={disliked.isPending || like.isPending}
      >
        <ThumbsDownIcon
          className={cn("w-5 h-5", viewerReaction == "dislike" && "fill-black")}
        />
        {dislike}
      </Button>
    </div>
  );
};
