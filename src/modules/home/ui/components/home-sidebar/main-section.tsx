"use client";
import { useAuth, useClerk } from "@clerk/nextjs";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
import Link from "next/link";

const items = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Subcriptions",
    url: "/feed/subcripton",
    icon: PlaySquareIcon,
    auth: true,
  },
  {
    title: "Trending",
    url: "/feed/trending",
    icon: FlameIcon,
  },
];

export const MainSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
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
