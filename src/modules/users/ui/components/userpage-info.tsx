import { UserAvatar } from "@/components/user-avatat";
import { UserGetOneOutPut } from "../../types";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubcriptonButton } from "@/modules/subcripton/ui/components/subcription-button";
import { useSubcriptionHook } from "@/modules/subcripton/hooks/use-subcription-hook";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserInfoProps {
  user: UserGetOneOutPut;
}

export const UserInfoPageSkeleton = () => {
  return (
    <div className="py-6">
      {/* mobile devices */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[60px] w-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>
      {/*Desktop devices */}
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="h-[100px] w-[100px] rounded-full" />
        <div className="flex-1 min-w-0 mt-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48 mt-4" />
          <Skeleton className="h-10 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export function UserInfoPage({ user }: UserInfoProps) {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const { isPending, onClick } = useSubcriptionHook({
    userId: user.id,
    isSubscribed: user.viewerSubcribed,
  });

  return (
    <>
      <div className="py-6">
        {/* Mobile devices */}

        <div className="flex flex-col md:hidden">
          <div className="flex items-center gap-3">
            <UserAvatar
              size={"lg"}
              imageUrl={user.imageUrl}
              name={user.name}
              className="h-[60px] w-[60px]"
              onClick={() => {
                if (userId === user.clerkId) {
                  clerk.openUserProfile();
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>{user.subcriptionCount} Subscribers</span>
                <span>•</span>
                <span>{user.videocount} Videos</span>
              </div>
            </div>
          </div>
          {userId === user.clerkId ? (
            <Button
              variant={"secondary"}
              asChild
              className="w-full mt-3 rounded-full"
            >
              <Link href={"/studio"}>Go to Studio</Link>
            </Button>
          ) : (
            <SubcriptonButton
              disabled={isPending || !isLoaded}
              isSubscribed={user.viewerSubcribed}
              onClick={onClick}
              className="w-full mt-3"
            />
          )}
        </div>
        {/* Desktop devices */}
        <div className="hidden md:flex items-start gap-4">
          <UserAvatar
            size={"lg"}
            imageUrl={user.imageUrl}
            name={user.name}
            className={cn("h-[100px] w-[100px]",
              userId === user.clerkId &&
                "cursor-pointer hover:opacity-80 transition-opacity duration-300"
            )}
            onClick={() => {
              if (userId === user.clerkId) {
                clerk.openUserProfile();
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
              <span>{user.subcriptionCount} Subscribers</span>
              <span>•</span>
              <span>{user.videocount} Videos</span>
            </div>

            {userId === user.clerkId ? (
              <Button
                variant={"secondary"}
                asChild
                className=" mt-3 rounded-full"
              >
                <Link href={"/studio"}>Go to Studio</Link>
              </Button>
            ) : (
              <SubcriptonButton
                disabled={isPending || !isLoaded}
                isSubscribed={user.viewerSubcribed}
                onClick={onClick}
                className=" mt-3"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
