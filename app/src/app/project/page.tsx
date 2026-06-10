"use client";

import { Suspense } from "react";
import { ProjectClient } from "@/components/project/ProjectClient";

export default function ProjectPage() {
  return (
    <Suspense fallback={null}>
      <ProjectClient />
    </Suspense>
  );
}
