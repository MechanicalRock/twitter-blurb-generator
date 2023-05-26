import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

export default async function handler(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const scanId = params.get("scanId");
  const body = await req.json();

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}/scans/${scanId}/results.json`,
      {
        method: "PUT",
        body: JSON.stringify(body.text.comparison),
      }
    );
  } catch (e) {
    console.error("Error writing to Firebase database", e);
    throw e;
  }

  return NextResponse.json({ message: "Result exported successfully" });
}
