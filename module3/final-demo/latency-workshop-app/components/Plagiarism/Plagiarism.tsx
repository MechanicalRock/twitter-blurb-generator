import { Box } from "@mui/material";
import { Loading } from "./Loading";
import { Score } from "./Score";

interface Props {
  loading: boolean;
  score?: number;
}

export function Plagiarism({ loading, score }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <Loading />
      ) : (
        typeof score === "number" && (
          <Score value={score} label={`${Math.round(score)}%`} />
        )
      )}
    </Box>
  );
}
