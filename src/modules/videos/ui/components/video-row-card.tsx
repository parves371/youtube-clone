import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatat";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useMemo } from "react";
import { VideoGetManyOutPut } from "../../types";
import { VideoMenu } from "./video-menu";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

const videoRowCardVariants = cva("flex group min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compect: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[30%]",
      compect: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutPut["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = ({ size }: VariantProps<typeof videoRowCardVariants> ) => {
  return (
    <div className={videoRowCardVariants({ size })}>
      {/* Thumbnail skeleton */}
      <div className={thumbnailVariants({ size })}>
        <VideoThumbnailSkeleton />
      </div>

      {/* Info skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 min-w-0">
            <Skeleton
              className={cn("h-5 w-[40%]", size === "compect" && "h-4 w-[40%]")}
            />
            {size === "default" && (
              <>
                <Skeleton className="h-4 w-[20%] mt-1" />
                <div className="flex items-center gap-2 my-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            )}

            {size === "compect" && (
              <>
                <Skeleton className="h-4 w-[50%] mt-1" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRowCard = ({ data, size, onRemove }: VideoRowCardProps) => {
  const compectViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compectLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likecount);
  }, [data.likecount]);

  return (
    <div className={videoRowCardVariants({ size })}>
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compect" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compectViews} views • {compectLikes} likes
              </p>
            )}
            {size === "default" && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size={"sm"} name={data.user.name} />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                        {data.description ?? "no description"}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="bg-black/70"
                    >
                      <p>From the video description</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
            {size === "compect" && (
              <UserInfo size={"sm"} name={data.user.name} />
            )}
            {size === "compect" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compectViews} views • {compectLikes} likes
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
};
