import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { brand } from "../theme";

type Props = {
  step: number;
  title: string;
  tag?: string;
  done?: boolean;
  children: ReactNode;
};

export default function StepCard({ step, title, tag, done = false, children }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: done ? "rgba(52, 211, 153, 0.45)" : "divider",
        overflow: "hidden",
        transition: "border-color 240ms ease, box-shadow 240ms ease",
        boxShadow: done ? "0 0 0 1px rgba(52,211,153,0.18), 0 14px 40px -28px rgba(52,211,153,0.5)" : "none"
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", px: 1.75, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: 26,
            height: 26,
            flex: "none",
            borderRadius: 2,
            border: "1px solid",
            borderColor: done ? "transparent" : "divider",
            background: done ? brand.gradient : brand.elevated,
            color: done ? "#06121b" : "text.secondary",
            fontSize: "0.78rem",
            fontWeight: 800,
            transition: "all 240ms ease"
          }}
        >
          <Fade in={done} timeout={260} unmountOnExit>
            <CheckRoundedIcon sx={{ fontSize: 18, position: "absolute" }} />
          </Fade>
          {!done && step}
        </Box>
        <Typography variant="h2" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {tag ? (
          <Typography sx={{ color: brand.faint, fontSize: "0.74rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            {tag}
          </Typography>
        ) : null}
      </Stack>
      <Stack spacing={1.5} sx={{ p: 1.875 }}>
        {children}
      </Stack>
    </Paper>
  );
}
