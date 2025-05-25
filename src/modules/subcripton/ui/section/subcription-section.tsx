"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
  SubcriptionItem,
  SubscriptionsItemsSkleTon,
} from "../components/subscription-item";

export const SubcriptinsSection = () => {
  return (
    <Suspense fallback={<SubcriptinsSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <SubcriptinsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubcriptinsSkeletion = () => {
  return (
    <div className="flex flex-col gap-4'">
      {Array.from({ length: 5 }).map((_, i) => (
        <SubscriptionsItemsSkleTon key={i} />
      ))}
    </div>
  );
};

const SubcriptinsSectionSuspense = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] =
    trpc.subcriptions.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const unsubcribe = trpc.subcriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("unsubcribed");
      utils.subcriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({
        id: data.creatorId,
      });
    },
    onError: () => {
      toast.error("sumthing went wrong");
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4'">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              href={`/users/${subscription.user.id}`}
              key={subscription.creatorId}
            >
              <SubcriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subcriberCount}
                onUnsubcribe={() => {
                  unsubcribe.mutate({
                    userId: subscription.creatorId,
                  });
                }}
                disabled={unsubcribe.isPending}
              />
            </Link>
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
