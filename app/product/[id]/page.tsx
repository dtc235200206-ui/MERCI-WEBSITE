import { Suspense } from "react";
import ProductView from "@/components/ProductView";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductView key={id} id={id} />;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <Inner params={params} />
    </Suspense>
  );
}