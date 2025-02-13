"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectonProps {
  categoryId?: string;
}

export const CategoriesSecton = ({ categoryId }: CategoriesSectonProps) => {
  return (
    <Suspense fallback={<CategoriesSkeletion />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <CategoriesSectonSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CategoriesSkeletion = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => {}} />;
};

const CategoriesSectonSuspense = ({ categoryId }: CategoriesSectonProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };

  return (
    <FilterCarousel
      value={categoryId}
      data={data}
      onSelect={onSelect}
    />
  );
};
