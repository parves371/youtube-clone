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

export const LikedVideosSection = () => {
  return (
    <Suspense fallback={<LikedVideosSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <LikedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const LikedVideosSkeletion = () => {
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

const LikedVideosSectionSuspense = () => {
  const [videos, query] = trpc.playlist.getLiked.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden'">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size={"compect"} />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex'">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
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
