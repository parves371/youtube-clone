import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatat";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentsGetManyOutPut } from "../../types";
import { CommentForm } from "./commnet-form";
import { CommentReplies } from "./commnet-replies";
interface CommentItemProps {
  comment: CommentsGetManyOutPut["items"][number];
  variant?: "reply" | "comment";
}
export const CommentItem = ({
  comment,
  variant = "comment",
}: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment removed");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  return (
    <div>
      <div className="flex gap-4">
        <Link prefetch href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user.imageUrl || "user-placeholder.svg"}
            name={comment.user.name || "anonymous"}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link prefetch href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                size={"icon"}
                className="size-8"
                variant={"ghost"}
                onClick={() => {
                  like.mutate({ commentId: comment.id });
                }}
                disabled={like.isPending}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReactions === "like" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                size={"icon"}
                className="size-8"
                variant={"ghost"}
                onClick={() => {
                  dislike.mutate({ commentId: comment.id });
                }}
                disabled={dislike.isPending}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReactions === "dislike" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
            {variant === "comment" && (
              <Button
                size={"sm"}
                className="h-8"
                variant={"ghost"}
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              Reply
            </DropdownMenuItem>
            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isReplyOpen && (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentid={comment.id}
            videoId={comment.videoId}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
            onCancel={() => setIsReplyOpen(false)}
          />
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            variant={"tertiary"}
            size={"sm"}
            onClick={() => setIsRepliesOpen((curent) => !curent)}
          >
            {isRepliesOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            {comment.replyCount} Replies
          </Button>
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} video={comment.videoId} />
      )}
    </div>
  );
};
