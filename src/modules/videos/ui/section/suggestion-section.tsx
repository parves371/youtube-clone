"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/vedio-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface SugggestionSectionProps {
  vedioId: string;
  isMenual?: boolean;
}
export const SugggestionSection = ({ vedioId }: SugggestionSectionProps) => {
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
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
