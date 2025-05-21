import { DEFAULT_LIMIT } from "@/constants";
import { HistoryView } from "@/modules/playlist/ui/views/history-views";
import { HydrateClient, trpc } from "@/trpc/server";

const page = async () => {
  void trpc.playlist.getHistory.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
};

export default page;
