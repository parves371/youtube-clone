"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { snackCaseToTitle } from "@/lib/utils";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";

export const VideosSection = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.items)
              .map((video) => {
                return (
                  <Link
                    href={`/studio/videos/${video.id}`}
                    key={video.id}
                    legacyBehavior
                  >
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative aspect-video w-36 shrink-0">
                            <VideoThumbnail
                              imageUrl={video.thumbnailUrl}
                              previewUrl={video.previewUrl}
                              title={video.title}
                              duration={video.duration || 0}
                            />
                          </div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="text-sm line-clamp-1">
                              {video.title}
                            </span>
                            <span className="text-xs line-clamp-1 text-muted-foreground">
                              {video.description || "no description"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {video.visibility === "private" ? (
                            <LockIcon className="size-4 mr-2" />
                          ) : (
                            <Globe2Icon className="size-4 mr-2" />
                          )}
                          {snackCaseToTitle(video.visibility || "error")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {snackCaseToTitle(video.muxStatus || "error")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(video.createAt), "d MMM yyyy")}
                      </TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Comments</TableCell>
                      <TableCell>Likes</TableCell>
                    </TableRow>
                  </Link>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        isManual
      />
    </div>
  );
};
