import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

export const VideoReactions = () => {
  const videoReaction: "like" | "dislike" = "like";
  return (
    <div className="flex items-center flex-none ">
      <Button
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        variant={"secondary"}
      >
        <ThumbsUpIcon
          className={cn("w-5 h-5", videoReaction === "like" && "fill-black")}
        />
        {1}
      </Button>
      <Separator orientation="vertical" />
      <Button
        className="rounded-l-none rounded-r-full gap-2 pl-3"
        variant={"secondary"}
      >
        <ThumbsDownIcon
          className={cn("w-5 h-5", videoReaction !== "like" && "fill-black")}
        />
        {1}
      </Button>
    </div>
  );
};
