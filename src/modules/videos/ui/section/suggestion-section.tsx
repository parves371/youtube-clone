"use client"

import { DEFAULT_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"

interface SugggestionSectionProps {
  vedioId:string
}
export const SugggestionSection = ({vedioId}:SugggestionSectionProps) => {
  const [suggestion]=trpc.suggestions.getMany.useSuspenseInfiniteQuery({
    vedioId,
    limit:DEFAULT_LIMIT
  },{
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  return (
    <div>{JSON.stringify(suggestion)}</div>
  )
}
