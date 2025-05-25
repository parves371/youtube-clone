import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/subcripton/ui/views/subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";

const page = async () => {
  void trpc.subcriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default page;
