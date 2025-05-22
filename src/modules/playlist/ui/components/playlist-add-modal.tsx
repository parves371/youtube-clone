import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();
  const {
    data: playlists,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.playlist.getManyForVideo.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      videoId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!videoId && open,
    }
  );

  const addVideo = trpc.playlist.addVideo.useMutation({
    onSuccess: () => {
      toast.success(`Video added to playlist`);
      utils.playlist.getMany.invalidate();
      utils.playlist.getManyForVideo.invalidate({ videoId });
      // TODO: invaidate Plyalist get one
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const removeVideo = trpc.playlist.removeVideo.useMutation({
    onSuccess: () => {
      toast.success(`Video  removed from playlist`);
      utils.playlist.getMany.invalidate();
      utils.playlist.getManyForVideo.invalidate({ videoId });
      // TODO: invaidate Plyalist get one
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add to playlist"
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          playlists?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start px-2 [&_svg]:size-5"
                size={"lg"}
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideo.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  } else {
                    addVideo.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  }
                }}
                disabled={addVideo.isPending || removeVideo.isPending}
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2 " />
                ) : (
                  <SquareIcon className="mr-2 " />
                )}

                {playlist.name}
              </Button>
            ))}

        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
