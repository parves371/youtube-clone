"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
  playlistId?: string;
}

export function PlaylistHeaderSection({
  playlistId,
}: PlaylistHeaderSectionProps) {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error loading playlist header</div>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
}

const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};

const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  const [playlist] = trpc.playlist.getOne.useSuspenseQuery({
    id: playlistId ?? "",
  });
  const utils = trpc.useUtils();
  const router = useRouter();
  const removed = trpc.playlist.revove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed successfully");
      utils.playlist.getMany.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-sm text-muted-foreground">
          videos from your history.
        </p>
      </div>
      <Button
        variant={"outline"}
        size="icon"
        className="rounded-full"
        onClick={() => removed.mutate({ id: playlist.id })}
        disabled={removed.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
};
