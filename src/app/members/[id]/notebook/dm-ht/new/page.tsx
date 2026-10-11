import { Suspense } from "react";
import { DmHtNewPage } from "@/components/dm-ht-new-page";

export default function NewDmHtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center" />
      }
    >
      <NewDmHtBody params={params} />
    </Suspense>
  );
}

async function NewDmHtBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DmHtNewPage memberId={id} />;
}
