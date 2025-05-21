import { useMemo } from "react";
import { VideoGetManyOutPut } from "../../types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatat";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoInfoProps {
  data: VideoGetManyOutPut["items"][number];
  onRemove?: () => void;
}
export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  );
};

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compectViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compectDate = useMemo(() => {
    return formatDistanceToNow(data.createAt, {
      addSuffix: true,
    });
  }, [data.createAt]);

  return (
    <div className="flex gap-3">
      <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`}>
          <h3 className="font-semibold line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        <Link href={`/users/${data.user.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {compectViews} views • {compectDate}
          </p>
        </Link>
      </div>
      <div className="flex-shrink-0">
        <VideoMenu onRemove={onRemove} videoId={data.id} variant="ghost" />
      </div>
    </div>
  );
};
