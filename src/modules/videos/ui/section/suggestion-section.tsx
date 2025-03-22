"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "../components/video-row-card";

interface SugggestionSectionProps {
  vedioId: string;
}
export const SugggestionSection = ({ vedioId }: SugggestionSectionProps) => {
  const [suggestion] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
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
            <VideoGridCard key={video.id} data={video} size={"compect"} />
          ))
        )}
      </div>
    </>
  );
};
