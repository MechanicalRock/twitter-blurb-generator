import { NextRequest, NextResponse } from "next/server";

import { CopyLeaksWrapper } from "@/lib/copy-leaks/copyLeaksWrapper";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

type ScanRequest = {
  text: string;
};

export default async function handler(req: NextRequest) {
  const copyLeaks = new CopyLeaksWrapper();
  const body = (await req.json()) as ScanRequest;
  const scanId = await copyLeaks.scan(body.text);
  return NextResponse.json({ scanId });
}
