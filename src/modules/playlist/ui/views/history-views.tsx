import { HistoryVideosSection } from "../sections/history-section";

export const HistoryView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">
         videos you have watched recently.
        </p>
      </div>

      <HistoryVideosSection  />
    </div>
  );
};
