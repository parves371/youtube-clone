"use client";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  UserPageBanner,
  UserPageBannerSkeleton,
} from "../components/user-page-banner";
import {
  UserInfoPage,
  UserInfoPageSkeleton,
} from "../components/userpage-info";
import { Separator } from "@/components/ui/separator";

interface UserSectionProps {
  userId: string;
}

export const UserSection = (props: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkleton />}>
      <ErrorBoundary fallback={<p>error</p>}>
        <UserSectoinSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

const UserSectionSkleton = () => {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserInfoPageSkeleton />
      <Separator />
    </div>
  );
};

const UserSectoinSuspense = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
  return (
    <div className=" flex flex-col">
      <UserPageBanner user={user} />
      <UserInfoPage user={user} />
      <Separator />
    </div>
  );
};
