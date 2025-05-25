"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatat";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const LoadingSkleton = () => {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton disabled>
            <Skeleton className="size-6 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export const SubcriptionsSection = () => {
  const pathname = usePathname();

  const { data, isLoading } = trpc.subcriptions.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subcription</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading && <LoadingSkleton />}

        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((subcription) => (
              <SidebarMenuItem
                key={`${subcription.viewerId}-${subcription.creatorId}`}
              >
                <SidebarMenuButton
                  tooltip={subcription.user.name}
                  asChild
                  isActive={pathname === `/users/${subcription.user.id}`}
                >
                  <Link
                    href={`/users/${subcription.user.id}`}
                    className="flex items-center gap-4"
                  >
                    <UserAvatar
                      size={"xs"}
                      imageUrl={subcription.user.imageUrl}
                      name={subcription.user.name}
                    />
                    <span className="text-sm">{subcription.user.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        {!isLoading && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === `/subscriptions`}>
              <Link href={`/subscriptions`} className="flex items-center gap-4">
                <ListIcon className="size-4" />
                <span className="text-sm">all Subcriptions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};
