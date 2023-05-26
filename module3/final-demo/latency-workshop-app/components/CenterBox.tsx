import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";

export function CenterBox({ children, sx }: { children: React.ReactNode; sx?: SxProps }) {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
