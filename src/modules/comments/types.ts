import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type CommentsGetManyOutPut =
  inferRouterOutputs<AppRouter>["comments"]["getMany"];
