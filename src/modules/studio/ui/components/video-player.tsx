"use client";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPalyerProps {
  playbackId: string | null | undefined;
  thumbnailUrl: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}
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
      poster={thumbnailUrl || "/placeholder.svg"}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};
