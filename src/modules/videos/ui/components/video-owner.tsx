import { UserAvatar } from "@/components/user-avatat";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { VideoGetOneOutPut } from "../../types";
import { Button } from "@/components/ui/button";
import { SubcriptonButton } from "@/modules/subcripton/ui/components/subcription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";

interface VideoOwnerProps {
  user: VideoGetOneOutPut["user"];
  videoId: string;
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: ClerkUserId } = useAuth();
  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size={"lg"} name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {/* TODO: add subcribers count */}
              {0} subcribers
            </span>
          </div>
        </div>
      </Link>
      {ClerkUserId === user.clerkId ? (
        <Button asChild className="rounded-full" variant={"outline"}>
          <Link
            href={`/studio/videos/${videoId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit
          </Link>
        </Button>
      ) : (
        <SubcriptonButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-none"
        />
      )}
    </div>
  );
};
