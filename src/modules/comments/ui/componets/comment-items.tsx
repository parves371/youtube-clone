import { UserAvatar } from "@/components/user-avatat";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CommentsGetManyOutPut } from "../../types";
interface CommentItemProps {
  comment: CommentsGetManyOutPut[number];
}
export const CommentItem = ({ comment }: CommentItemProps) => {
  console.log({ comment });
  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
            imageUrl={comment.user.imageUrl || "user-placeholder.svg"}
            name={comment.user.name || "anonymous"}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
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
        </div>
      </div>
    </div>
  );
};
