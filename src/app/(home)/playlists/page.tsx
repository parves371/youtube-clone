import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistView } from "@/modules/playlist/ui/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";

const page = async () => {
  void trpc.playlist.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <PlaylistView />
    </HydrateClient>
  );
};

export default page;
