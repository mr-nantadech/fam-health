import { Suspense } from "react";
import { MemberDetail } from "@/components/member-detail";

export default function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ book?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center" />
      }
    >
      <MemberBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function MemberBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ book?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <MemberDetail memberId={id} initialBook={query.book === "dm-ht"} />;
}
