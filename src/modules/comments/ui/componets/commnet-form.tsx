import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatat";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
  variant?: "comment" | "reply";
  parentid?: string;
  onCancel?: () => void;
}
export const CommentForm = ({
  videoId,
  onSuccess,
  onCancel,
  parentid,
  variant = "comment",
}: CommentFormProps) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const clerk = useClerk();

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      utils.comments.getMany.invalidate({ videoId, parentId: parentid });
      toast.success("Comment added");
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema.omit({ userId: true })),
    defaultValues: {
      parentId: parentid,
      videoId,
      content: "",
    },
  });

  const handleSubmit = (value: z.infer<typeof commentInsertSchema>) => {
    create.mutate(value);
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex gap-4 group"
      >
        <UserAvatar
          size={"lg"}
          imageUrl={user?.imageUrl || "user-placeholder.svg"}
          name={user?.fullName || "Anonymous"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "comment"
                        ? "Add a comment..."
                        : "Add a reply..."
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0 w-full p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={handleCancel}
                disabled={create.isPending}
                type="button"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" size={"sm"} disabled={create.isPending}>
              {variant === "comment" ? "Comment" : "Reply"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
