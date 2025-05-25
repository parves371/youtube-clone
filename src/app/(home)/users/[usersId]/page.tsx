import { DEFAULT_LIMIT } from "@/constants";
import { UserView } from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    usersId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { usersId } = await params;

  void trpc.users.getOne.prefetch({
    id: usersId,
  });
  void trpc.videos.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    userId: usersId,
  });
  return (
    <HydrateClient>
      <UserView userId={usersId} />
    </HydrateClient>
  );
};

export default page;
