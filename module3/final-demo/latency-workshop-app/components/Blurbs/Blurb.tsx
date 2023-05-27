import { Box, Card, CardContent, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { FirebaseWrapper } from "@/lib/firebase/FireBaseWrapper";
import { Plagiarism } from "@/components/Plagiarism/Plagiarism";
import SaveIcon from "@mui/icons-material/Save";
import { onValue } from "firebase/database";

interface Props {
  generatingBlurb: string;
  blurbsFinishedGenerating: boolean;
}

type ScanResponse = {
  scanId: string;
};

export function Blurb({ generatingBlurb, blurbsFinishedGenerating }: Props) {
  const [blurb, setBlurb] = useState<string>();
  const [rephrasedBlurb, setRephrasedBlurb] = useState("");
  const [enableEditor, setEnableEditor] = useState<boolean>(false);
  const [plagiarismLoading, setPlagiarismLoading] = useState<boolean>(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number>();
  const [highlightedHTMLBlurb, setHighlightedHTMLBlurb] =
    useState<JSX.Element>();

  const checkPlagiarism = async (streamedBlurb: string) => {
    setPlagiarismLoading(true);
    const scanResponse = await fetch("/api/plagiarismCheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: streamedBlurb,
      }),
    });
    const scanId = ((await scanResponse.json()) as ScanResponse).scanId;

    const firebase = new FirebaseWrapper();
    const scanRef = firebase.getScanReference(scanId);
    onValue(scanRef, async (scanRecord: any) => {
      // Only continue if a <scanId> node is present in Firebase
      if (scanRecord.exists()) {
        const scan = scanRecord.val();
        handleScan(streamedBlurb, scan);
      }
    });
  };

  function handleScan(text: string, scan: any) {
    const totalBlurbWords = text.split(" ").length;
    const matchedWords = scan.matchedWords;
    setPlagiarismScore((matchedWords / totalBlurbWords) * 100);
    if (scan.results) {
      const characterStarts = scan.results.identical.source.chars.starts;
      const characterLengths = scan.results.identical.source.chars.lengths;
      const highlightedHTMLBlurb = getHighlightedHTMLBlurb(
        text,
        characterStarts,
        characterLengths
      );
      setHighlightedHTMLBlurb(highlightedHTMLBlurb);
      setPlagiarismLoading(false);
    }
  }

  function getHighlightedHTMLBlurb(
    text: string,
    characterStarts: number[],
    characterLengths: number[]
  ) {
    let characterStartsIndex = 0;
    let highlightedHTMLBlurb = "";
    for (let i = 0; i < text.length; i++) {
      if (i == characterStarts[characterStartsIndex]) {
        const segmentStart = characterStarts[characterStartsIndex];
        const segmentEnd =
          characterStarts[characterStartsIndex] +
          characterLengths[characterStartsIndex];

        highlightedHTMLBlurb += `<mark style="background:#FF9890">${text.substring(
          segmentStart,
          segmentEnd
        )}</mark>`;

        i = segmentEnd - 1;
        characterStartsIndex = characterStartsIndex + 1;
      } else {
        highlightedHTMLBlurb += text[i];
      }
    }
    return (
      <Box dangerouslySetInnerHTML={{ __html: highlightedHTMLBlurb }}></Box>
    );
  }

  useEffect(() => {
    if (blurbsFinishedGenerating) {
      checkPlagiarism(generatingBlurb);
      setBlurb(generatingBlurb);
      setHighlightedHTMLBlurb(<>{generatingBlurb}</>);
    }
  }, [blurbsFinishedGenerating]);

  return (
    <>
      <Stack direction="row" spacing="1em">
        <Card sx={{ width: "37em" }}>
          <CardContent>
            {!blurbsFinishedGenerating ? (
              generatingBlurb
            ) : enableEditor ? (
              <>
                <TextField
                  className="bg-white rounded-xl"
                  defaultValue={blurb}
                  onChange={(event) => {
                    setRephrasedBlurb(event.target.value);
                  }}
                  multiline
                  style={{ width: "100%" }}
                ></TextField>
                <Stack direction="row-reverse" spacing="0.5em">
                  <Box>
                    <CloseIcon
                      className="cursor-pointer"
                      onClick={() => {
                        setEnableEditor(false);
                      }}
                    ></CloseIcon>
                  </Box>
                  <Box>
                    <SaveIcon
                      className="cursor-pointer"
                      onClick={() => {
                        setBlurb(rephrasedBlurb);
                        setHighlightedHTMLBlurb(<>{rephrasedBlurb}</>);
                        setEnableEditor(false);
                      }}
                    ></SaveIcon>
                  </Box>
                </Stack>
              </>
            ) : (
              <>
                {highlightedHTMLBlurb}
                <Stack direction="row-reverse" spacing="0.5em">
                  <Box>
                    <EditIcon
                      className="cursor-pointer"
                      onClick={() => setEnableEditor(true)}
                    />
                  </Box>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
        <Stack
          alignItems="center"
          justifyContent="center"
          width="12em"
          className="bg-white rounded-xl shadow-md p-4 border"
        >
          <Plagiarism loading={plagiarismLoading} score={plagiarismScore} />
        </Stack>
      </Stack>
    </>
  );
}
