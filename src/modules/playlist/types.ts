import { appRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type PlaylistGetManyOutPut = inferRouterOutputs<
  typeof appRouter
>["playlist"]["getMany"];
