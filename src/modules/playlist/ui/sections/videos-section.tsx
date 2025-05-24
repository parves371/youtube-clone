"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/vedio-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface VideosVideosSectionProps {
  playlistId: string;
}
export const VideosVideosSection = (props: VideosVideosSectionProps) => {
  return (
    <Suspense fallback={<VideosVideosSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosVideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosVideosSkeletion = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden'">
        {Array.from({ length: 12 }).map(
          (
            _,
            index // Render 12 skeleton cards as a placeholder
          ) => (
            <VideoRowCardSkeleton key={index} size={"compect"} />
          )
        )}
      </div>
      <div className="hidden flex-col gap-4 md:flex'">
        {Array.from({ length: 12 }).map(
          (
            _,
            index // Render 12 skeleton cards as a placeholder
          ) => (
            <VideoGridCardSkeleton key={index} />
          )
        )}
      </div>
    </div>
  );
};

const VideosVideosSectionSuspense = ({
  playlistId,
}: VideosVideosSectionProps) => {
  const [videos, query] = trpc.playlist.getVideos.useSuspenseInfiniteQuery(
    {
      playlistId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const utils = trpc.useUtils();

  const removeVideo = trpc.playlist.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success(`Video  removed from playlist`);
      utils.playlist.getMany.invalidate();
      utils.playlist.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlist.getOne.invalidate({ id: data.playlistId });
      utils.playlist.getVideos.invalidate({ playlistId: data.playlistId });
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden'">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              onRemove={() =>
                removeVideo.mutate({ playlistId, videoId: video.id })
              }
            />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex'">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() =>
                removeVideo.mutate({ playlistId, videoId: video.id })
              }
            />
          ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
