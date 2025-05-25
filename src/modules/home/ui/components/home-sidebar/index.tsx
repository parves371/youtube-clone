import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SignedIn } from "@clerk/nextjs";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";
import { SubcriptionsSection } from "./subscriptions-section";

export const HomeSideBar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />
        <SignedIn>
          <>
            <Separator />
            <SubcriptionsSection />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};
