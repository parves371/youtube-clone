import { DEFAULT_LIMIT } from "@/constants";
import { LikedView } from "@/modules/playlist/ui/views/liked-views";
import { HydrateClient, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic"; // Force dynamic rendering for this page

const page = async () => {
  void trpc.playlist.getLiked.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
};

export default page;
