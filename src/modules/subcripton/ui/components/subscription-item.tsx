import { UserAvatar } from "@/components/user-avatat";
import { SubcriptonButton } from "./subcription-button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubcribe: () => void;
  disabled: boolean;
}

export const SubscriptionsItemsSkleTon = () => {
  return (
    <div className="flex items-start gap-4 mt-2">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 mt-1" />
          </div>

          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
};
export const SubcriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubcribe,
  disabled,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar imageUrl={imageUrl} size={"lg"} name={name} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
          <SubcriptonButton
            size={"sm"}
            onClick={(e) => {
              e.preventDefault();
              onUnsubcribe();
            }}
            disabled={disabled}
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};
