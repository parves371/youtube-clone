import { Button } from "@/components/ui/button";
import {
  DropdownMenu, // 'DropdownMenu' is defined but never used.
  DropdownMenuContent, // 'DropdownMenuContent' is defined but never used.
  DropdownMenuItem, // 'DropdownMenuItem' is defined but never used.
  DropdownMenuTrigger, // 'DropdownMenuTrigger' is defined but never used.
} from "@/components/ui/dropdown-menu";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}
// TODO: implement remove video
export const VideoMenu = ({
  videoId, // 'videoId' is defined but never used.
  variant,
  onRemove, // 'onRemove' is defined but never used.
}: VideoMenuProps) => {
  const onShare = () => {
    const fullUrl = `${
      // TODO:Change if its Outlide of vercel
      process.env.VERCEL_URL || "http://localhost:3000"
    }/videos/${videoId}`;

    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to clipboard");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className="rounded-full">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={onShare}>
          <ShareIcon className="mr-2 size-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <ListPlusIcon className="mr-2 size-4" />
          Add to playlist
        </DropdownMenuItem>
        {onRemove && (
          <DropdownMenuItem onClick={() => {}}>
            <Trash2Icon className="mr-2 size-4" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
