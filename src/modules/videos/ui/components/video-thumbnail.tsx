import { formateDuratin } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
}

export const VideoThumbnail = ({
  imageUrl,
  title,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>

      {/* videio duration box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formateDuratin(duration)}
      </div>
    </div>
  );
};
