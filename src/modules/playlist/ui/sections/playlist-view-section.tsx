"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "../components/playlist-gride-card";

export const PlaylistSection = () => {
  return (
    <Suspense fallback={<PlaylistSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <PlaylistSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistSkeletion = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width: 1920px)]:grid-cols-5 [@media(min-width: 2200px)]:grid-cols-6">
      {Array.from({ length: 12 }).map(
        (
          _,
          index // Render 12 skeleton cards as a placeholder
        ) => (
          <PlaylistGridCardSkeleton key={index} />
        )
      )}
    </div>
  );
};

const PlaylistSectionSuspense = () => {
  const [playlist, query] = trpc.playlist.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width: 1920px)]:grid-cols-5 [@media(min-width: 2200px)]:grid-cols-6'">
        {playlist.pages
          .flatMap((page) => page.items)
          .map((item) => (
            <PlaylistGridCard key={item.id} data={item} />
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
