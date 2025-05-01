"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/vedio-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SugggestionSectionProps {
  vedioId: string;
  isMenual?: boolean;
}

export const SugggestionSection = ({
  vedioId,
  isMenual,
}: SugggestionSectionProps) => {
  return (
    <Suspense>
      <ErrorBoundary fallback={<SuggestionsSectionSkeleton />}>
        <SuggestionsSectionSuspense vedioId={vedioId} isMenual={isMenual} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SuggestionsSectionSkeleton = () => {
  return (
    <>
      <div className=" hidden md:block space-y-3 ">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compect" />
        ))}
      </div>
      <div className="block md:hidden space-y-10">
        {Array.from({ length: 4 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

const SuggestionsSectionSuspense = ({
  vedioId,
  isMenual,
}: SugggestionSectionProps) => {
  const [suggestion, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
    {
      vedioId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestion.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoRowCard key={video.id} data={video} size={"compect"} />
          ))
        )}
      </div>
      <div className="block md:hidden space-y-10">
        {suggestion.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))
        )}
      </div>

      <InfiniteScroll
        isManual={isMenual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
