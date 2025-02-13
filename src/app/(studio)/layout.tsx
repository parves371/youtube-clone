import { StudioLayout } from "@/modules/studio/ui/layout/studio-layout";


interface LayoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return <StudioLayout>{children}</StudioLayout>;
};

export default layout;
