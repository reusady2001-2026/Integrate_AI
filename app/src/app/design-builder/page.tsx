"use client";

import { Suspense } from "react";
import { DesignBuilderClient } from "@/components/design-builder/DesignBuilderClient";

export default function DesignBuilderPage() {
  return (
    <Suspense fallback={null}>
      <DesignBuilderClient />
    </Suspense>
  );
}
