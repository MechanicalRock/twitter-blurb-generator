import { Box, CircularProgress } from "@mui/material";

export function Loading() {
  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress size="4em" />
      </Box>
      <Box paddingTop="0.5em" textAlign="center">
        Analysing Plagiarism
      </Box>
    </>
  );
}
