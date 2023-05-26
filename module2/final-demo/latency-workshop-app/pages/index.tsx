import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";

export default function Home() {
  const blurbRef = useRef("");
  const audienceRef = useRef<HTMLInputElement>();
  const [generatedBlurb, setGeneratedBlurb] = useState("");

  const generateBlurb = useCallback(async () => {
    const prompt = `Generate 3 twitter posts with hashtags and clearly labeled "1." , "2." and "3.". 
    Make sure each generated post is less than 280 characters, has short sentences that are found in Twitter posts, write it for a ${audienceRef.current.value} Audience, and base them on this context: ${blurbRef.current}`;

    console.log(prompt);
    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let firstPost = false;
    let streamedText = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamedText += chunkValue;
      if (firstPost) {
        setGeneratedBlurb(streamedText);
      } else {
        firstPost = streamedText.includes("1.");
      }
    }
  }, [blurbRef.current, audienceRef.current]);

  return (
    <Stack
      component="main"
      direction="column"
      maxWidth="50em"
      mx="auto"
      alignItems="center"
      justifyContent="center"
      py="1em"
      spacing="1em"
    >
      <Typography
        variant="h1"
        className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
      >
        Generate your next Twitter post with ChatGPT
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={4}
        onChange={(e) => {
          blurbRef.current = e.target.value;
        }}
        sx={{ "& textarea": { boxShadow: "none !important" } }}
        placeholder="e.g. I'm learning about NextJs and OpenAI GPT-3 api at the Latency Conference."
      ></TextField>

      <FormControl fullWidth>
        <InputLabel id="Audience">Audience</InputLabel>
        <Select
          labelId="Audience"
          id="Audience"
          label="Audience"
          inputRef={audienceRef}
          defaultValue={"Student"}
        >
          <MenuItem value={"Student"}>Student</MenuItem>
          <MenuItem value={"Profesional"}>Profesional</MenuItem>
          <MenuItem value={"Monkey"}>Monkey</MenuItem>
        </Select>
      </FormControl>

      <Button onClick={generateBlurb}>Generate Blurb</Button>
      {generatedBlurb && (
        <>
          {generatedBlurb
            .substring(generatedBlurb.indexOf("1.") + 3)
            .split(/2\.|3\./)
            .map((generatedPost, index) => {
              return (
                <Card key={index}>
                  <CardContent>{generatedPost}</CardContent>
                </Card>
              );
            })}
        </>
      )}
    </Stack>
  );
}
