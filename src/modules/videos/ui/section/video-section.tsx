"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPalyer } from "../components/video-player";
import VideoBanner from "../components/video-banner";
import { VideoTopRow } from "../components/video-top-row";

interface videoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: videoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeletion = () => {
  return <div>Loading...</div>;
};

const VideoSuspense = ({ videoId }: videoSectionProps) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPalyer
        //   autoPlay
          onPlay={() => {}}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
