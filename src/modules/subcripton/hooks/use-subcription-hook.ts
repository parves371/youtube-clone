import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubcriptionHookProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubcriptionHook = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubcriptionHookProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subcribe = trpc.subcriptions.create.useMutation({
    onSuccess: () => {
      utils.subcriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({
        id: userId,
      });
      toast.success("Subcribed");

      if (fromVideoId) {
        utils.videos.getOne.invalidate({
          id: fromVideoId,
        });
      }
    },
    onError: (error) => {
      toast.error("sumthing went wrong");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const unsubcribe = trpc.subcriptions.remove.useMutation({
    onSuccess: () => {
      utils.subcriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({
        id: userId,
      });
      toast.success("unsubcribed");

      if (fromVideoId) {
        utils.videos.getOne.invalidate({
          id: fromVideoId,
        });
      }
    },
    onError: (error) => {
      toast.error("sumthing went wrong");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subcribe.isPending || unsubcribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubcribe.mutate({
        userId,
      });
    } else {
      subcribe.mutate({
        userId,
      });
    }
  };

  return {
    isPending,
    onClick,
  };
};
