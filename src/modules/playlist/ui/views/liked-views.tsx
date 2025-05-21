import { LikedVideosSection } from "../sections/liked-views-section";

export const LikedView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Liked</h1>
        <p className="text-sm text-muted-foreground">
          videos you have Liked recently.
        </p>
      </div>

      <LikedVideosSection />
    </div>
  );
};
