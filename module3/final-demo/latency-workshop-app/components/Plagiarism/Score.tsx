import * as React from "react";

import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";
import { CenterBox } from "../CenterBox";
import Typography from "@mui/material/Typography";

export function Score(
  props: CircularProgressProps & { value: number; label: string }
) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box width="100%" display="inline-flex" position="relative">
        <CircularProgress
          variant="determinate"
          value={props.value}
          color="secondary"
          size="4em"
        />
        <CenterBox>
          <Typography variant="caption" component="div" color="text.secondary">
            {props.label}
          </Typography>
        </CenterBox>
      </Box>
    </Box>
  );
}
