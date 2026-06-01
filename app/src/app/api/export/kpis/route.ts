import { NextResponse } from "next/server";
import { KpiDocument } from "@/lib/schemas/kpis";
import { renderKpiDocx } from "@/lib/export/kpi-docx";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = KpiDocument.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid document", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const buf = await renderKpiDocx(parsed.data);
  const filename = `kpis_${(parsed.data.company || "untitled").replace(/[^\w֐-׿]+/g, "_")}.docx`;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
