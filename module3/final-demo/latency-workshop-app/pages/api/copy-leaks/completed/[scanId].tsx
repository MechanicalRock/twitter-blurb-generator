import { NextRequest, NextResponse } from "next/server";

import { CopyLeaksWrapper } from "@/lib/copy-leaks/copyLeaksWrapper";

export const config = {
  runtime: "edge",
  regions: ["syd1"],
};

export default async function handler(req: NextRequest) {
  const body = await req.json();
  const scanId = body.scannedDocument.scanId;
  const { resultId, matchedWords } = getHighestSourceResult(body);
  if (matchedWords != 0) {
    const copyLeaks = new CopyLeaksWrapper();
    await copyLeaks.getDetailedResults(scanId, resultId);
  }
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}/scans/${scanId}.json`,
      {
        method: "PUT",
        body: JSON.stringify({ matchedWords: matchedWords }),
      }
    );
  } catch (e) {
    console.error("Error writing to Firebase Database", e);
    throw e;
  }

  return NextResponse.json({ message: "Scan complete" });
}

type SourceResults = {
  resultId: string;
  matchedWords: number;
};

function getHighestSourceResult(
  completedScanWebhookResponse: any
): SourceResults {
  let matchedWords = 0;
  let resultId = "";
  if (completedScanWebhookResponse.results.internet) {
    const sortedResults = completedScanWebhookResponse.results.internet.sort(
      (a, b) => a.matchedWords - b.matchedWords
    );
    const highestResult = sortedResults[0];
    resultId = highestResult.id;
    matchedWords = highestResult.matchedWords;
  }

  return {
    resultId,
    matchedWords: matchedWords,
  };
}
