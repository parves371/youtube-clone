import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlist/ui/views/videos-views";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this page

interface PageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { playlistId } = await params;
  void trpc.playlist.getVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });
  void trpc.playlist.getOne.prefetch({ id: playlistId });

  return (
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default page;
