import { ResponsiveModal } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadCompelted = () => {
    onOpenChange(false);
    utils.users.getOne.invalidate({ id: userId });
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload a banner"
    >
      <UploadDropzone
        endpoint={"BannerUploader"}
        onClientUploadComplete={onUploadCompelted}
      />
    </ResponsiveModal>
  );
};
