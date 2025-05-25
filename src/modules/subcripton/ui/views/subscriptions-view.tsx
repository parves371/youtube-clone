import { SubcriptinsSection } from "../section/subcription-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Youre currently subcribed channels
        </p>
      </div>

      <SubcriptinsSection />
    </div>
  );
};
