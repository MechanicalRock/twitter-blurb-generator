import { Card, CardContent } from "@mui/material";

interface Props {
  generatingBlurb: string;
}

export function Blurb({ generatingBlurb }: Props) {
  return (
    <Card>
      <CardContent>{generatingBlurb}</CardContent>
    </Card>
  );
}
