import { HomeLayout } from "@/modules/home/ui/layout/home-layout";

interface LayoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return <HomeLayout>{children}</HomeLayout>;
};

export default layout;
