import { HomeLayout } from "@/modules/home/ui/layout/home-layout";
// TODO: confirm if this is needed
export const dynamic = "force-dynamic";

interface LayoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return <HomeLayout>{children}</HomeLayout>;
};

export default layout;
