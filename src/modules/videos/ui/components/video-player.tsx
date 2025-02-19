"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPalyerProps {
  playbackId: string | null | undefined;
  thumbnailUrl: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPalyerSkeleton = () => {
  return (
    <div className="aspect-video w-full bg-zinc-900 rounded-xl">
      <Skeleton className="w-full h-full" />
    </div>
  );
};
export const VideoPalyer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPalyerProps) => {
  //   if (!playbackId) return null;

  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};
