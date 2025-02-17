import { ResponsiveModal } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const formschema = z.object({
  prompt: z.string().min(10, "Prompt is required"),
});

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {
  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: {
      prompt: "",
    },
  });

  const generateThumbnail = trpc.videos.genrateThumbail.useMutation({
    onSuccess: () => {
      toast.success("background jobs started", {
        description: "this may take a while",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("something went wrong");
    },
  });

  const onSubmit = (data: z.infer<typeof formschema>) => {
    generateThumbnail.mutate({
      prompt: data.prompt,
      id: videoId,
    });
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Thumbnail"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            name="prompt"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none"
                    cols={30}
                    rows={5}
                    placeholder="A description of the video"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={generateThumbnail.isPending}>
              Generate
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
