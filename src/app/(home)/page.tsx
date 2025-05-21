import { HydrateClient, trpc } from "@/trpc/server";

import { HomeView } from "@/modules/home/ui/views/home-view";
import { DEFAULT_LIMIT } from "@/constants";
export const dynamic = "force-dynamic";

interface HomeViewProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const HomePage = async ({ searchParams }: HomeViewProps) => {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    categoryId,
  });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default HomePage;
