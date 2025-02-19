import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

export const SubcriptonButton = ({
  onClick,
  disabled,
  isSubscribed,
  className,
  size
}: SubscriptionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn(
        "rounded-full",
        // isSubscribed &&
        //   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // !isSubscribed &&
        //   "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      size={size}
    >
      {isSubscribed ? "unSubscribe" : "Subscribe"}
    </Button>
  );
};
