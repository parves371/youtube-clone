import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface StudioUploaderProps {
  endpoint?: string | null;
  onSuccess: () => void;
}
const UPLOADERID = "video-uploader";
export const StudioUploader = ({
  endpoint,
  onSuccess,
}: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        id={UPLOADERID}
        className="hidden group/uploader"
      />

      <MuxUploaderDrop muxUploader={UPLOADERID} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32">
            <UploadIcon className="size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-300" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm ">Drag and Drop video files to upload</p>
            <p className="text-xs text-muted-foreground">
              Your video will be private until you publish them
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={UPLOADERID}>
            <Button type="button" className="rounded-full">
              Select file
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="hidden" />
        <MuxUploaderStatus muxUploader={UPLOADERID} className="text-sm" />

        <MuxUploaderProgress
          muxUploader={UPLOADERID}
          className="text-sm"
          type="percentage"
        />
        <MuxUploaderProgress muxUploader={UPLOADERID} type="bar" />
      </MuxUploaderDrop>
    </div>
  );
};
