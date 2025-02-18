import { AlertTriangleIcon } from "lucide-react";
import { VideoGetOneOutPut } from "../../types";
interface VideoBannerProps {
  status: VideoGetOneOutPut["muxStatus"];
}

const VideoBanner = ({ status }: VideoBannerProps) => {
  if (status === "ready") return null;
  return (
    <div className="bg-yellow-400 py-3 px-4 rounded-b-xl flex items-center gap-2">
      <AlertTriangleIcon className="text-black size-4 shrink-0" />
      <p className="text-xs md:text-sm font-medium text-black line-clamp-2">
        This Video is procecing
      </p>
    </div>
  );
};

export default VideoBanner;
