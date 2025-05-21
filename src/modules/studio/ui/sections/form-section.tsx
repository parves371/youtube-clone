"use client";

import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CopyCheckIcon,
  CopyIcon,
  GlobeIcon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/db/schema";
import { snackCaseToTitle } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { VideoPalyer } from "../../../videos/ui/components/video-player";
import { ThumbnailGenerateModal } from "../components/thumbnail-genrate-modal";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";

interface Props {
  videoId: string;
}

export const FormSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<FormSectionSkeletion />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeletion = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
            <div className="aspect-video overflow-hidden relative">
              <Skeleton className="aspect-video" />
            </div>
            <div className="p-4 flex flex-col gap-y-6">
              <div className="flex justify-between items-center gap-x-2">
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FormSectionSuspense = ({ videoId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video updated");
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });
  const removed = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video removed");
      router.push("/studio");
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });
  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video Revalidated");
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });
  const reStoreThumbnail = trpc.videos.restoreThumbail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video restored");
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const generateTitle = trpc.videos.genrateTitle.useMutation({
    onSuccess: () => {
      toast.success("background jobs started", {
        description: "this may take a while",
      });
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });
  const generateDescription = trpc.videos.genrateDescription.useMutation({
    onSuccess: () => {
      toast.success("background jobs started", {
        description: "this may take a while",
      });
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };

  //   TODO: change if deploying outline of Vercel
  const fullUrl = `${
     APP_URL ? `https://${APP_URL}` : "http://localhost:3000"
  }/videos/${videoId}`;
  const [isCpoied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-sm text-muted-foreground">
                Manege your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={update.isPending || !form.formState.isDirty}
              >
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <RotateCcwIcon className="w-4 h-4 mr-2" />
                    Revalidate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removed.mutate({ id: videoId })}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div
                        className="flex items-center gap-x-2
                      "
                      >
                        Title
                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          // disabled={
                          //   generateTitle.isPending || !video.muxTrackId
                          // }
                          disabled={true}
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div
                        className="flex items-center gap-x-2
                      "
                      >
                        Description
                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          // disabled={
                          //   generateDescription.isPending || !video.muxTrackId
                          // }
                          disabled={true}
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a description to your video"
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="p-0 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          fill
                          className="object-cover"
                          alt="thumbnail"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size={"icon"}
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 transition-opacity  duration-300 group-hover:opacity-100 size-7"
                            >
                              <MoreVerticalIcon className="w-4 h-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="w-4 h-4 mr-2" />
                              change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnailGenerateModalOpen(true)
                              }
                              disabled={true}
                            >
                              <SparklesIcon className="w-4 h-4 mr-2" />
                              AI-generate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                reStoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon className="w-4 h-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? "undefined"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPalyer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCpoied}
                        >
                          {isCpoied ? (
                            <CopyCheckIcon className="w-4 h-4" />
                          ) : (
                            <CopyIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Status
                      </p>
                      <p>{snackCaseToTitle(video.muxStatus || "preparing")}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitle Status
                      </p>
                      <p>
                        {snackCaseToTitle(
                          video.muxTrackStatus || "no subtitle"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                name="visibility"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    {/* todo: add ai  ganerate button */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? "undefined"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"public"}>
                          <div className="flex items-center ">
                            <GlobeIcon className="size-4 mr-2" /> Public
                          </div>
                        </SelectItem>
                        <SelectItem value={"private"}>
                          <div className="flex items-center ">
                            <LockIcon className="size-4 mr-2" /> Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
