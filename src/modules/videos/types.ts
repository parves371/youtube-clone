import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";


export type VideoGetOneOutPut =
inferRouterOutputs<AppRouter>["videos"]["getOne"];
