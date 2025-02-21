import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/view/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface Props {
  params: Promise<{ videoId: string }>;
}
const VideoPage = async ({ params }: Props) => {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  // TODO:Dont forget to fecth infintePrefetch
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default VideoPage;
