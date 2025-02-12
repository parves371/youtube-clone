"use client";
import { useAuth, useClerk } from "@clerk/nextjs";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FlameIcon, HistoryIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";

const items = [
  {
    title: "History",
    url: "/playlists/histtory",
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: "Like videos",
    url: "/playlists/liked",
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: "All playlist",
    url: "/playlists/trending",
    icon: FlameIcon,
    auth: true,
  },
];

export const PersonalSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>You</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              asChild
              isActive={false} //Todo: add active state
              onClick={(e) => {
                if (item.auth && !isSignedIn) {
                  e.preventDefault();
                  clerk.openSignIn();
                }
              }}
            >
              <Link href={item.url} className="flex items-center gap-4">
                <item.icon />
                <span className="text-sm">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
