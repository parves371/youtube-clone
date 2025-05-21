import { SubscribdedVideosSection } from "../section/subscrbed-videos-section";

export const SubscribedView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subcribed</h1>
        <p className="text-sm text-muted-foreground">
         Vedios from channels you are subscribed to.
        </p>
      </div>

      <SubscribdedVideosSection  />
    </div>
  );
};
