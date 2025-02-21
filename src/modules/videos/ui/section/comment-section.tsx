"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentItem } from "@/modules/comments/ui/componets/comment-items";
import { CommentForm } from "@/modules/comments/ui/componets/commnet-form";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentSectionProps {
  videoId: string;
}

export const CommentSection = ({ videoId }: CommentSectionProps) => {
  return (
    <Suspense fallback={<CommentSectionSkeletion />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <CommentSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentSectionSkeletion = () => {
  return (
    <div className="mt-6 flex justify-center items-center ">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
};

export const CommentSectionSuspense = ({ videoId }: CommentSectionProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div className="mt-6 flex flex-col gap-6">
      <h1 className="text-xl font-bold">
        {comments.pages[0].totalCount} Comments
      </h1>
      <CommentForm videoId={videoId} />
      <div className="flex flex-col gap-4 mt-2">
        {comments.pages
          .flatMap((page) => page.items)
          .map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

        <InfiniteScroll
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
          isManual
        />
      </div>
    </div>
  );
};
