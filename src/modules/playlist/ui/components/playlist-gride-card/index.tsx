import { PlaylistGetManyOutPut } from "@/modules/playlist/types";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import Link from "next/link";
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "./playlist-thumbnail";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";

interface PlaylistGridCardProps {
  data: PlaylistGetManyOutPut["items"][number];
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlist/${data.id}`} className="flex flex-col gap-2 group">
      <PlaylistThumbnail
        imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK}
        title={data.name}
        videoCount={data.videoCount}
      />
      <PlaylistInfo data={data} />
    </Link>
  );
};
