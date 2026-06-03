"use client";

import { Suspense } from "react";
import { BuilderClient } from "@/components/builder/BuilderClient";

export default function BuilderPage() {
  return (
    <Suspense fallback={null}>
      <BuilderClient />
    </Suspense>
  );
}
