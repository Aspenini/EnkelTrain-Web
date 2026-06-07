import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import type { Backend } from "../useEnkelTrain";
import { brand } from "../theme";
import BackendStatus from "./BackendStatus";

export default function TopBar({ backend }: { backend: Backend }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        background: "rgba(12, 15, 21, 0.72)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary"
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 }, minHeight: { xs: 58, sm: 64 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: brand.gradient,
              color: "#06121b",
              flex: "none",
              boxShadow: "0 8px 22px -10px rgba(94, 234, 212, 0.7)"
            }}
          >
            <SmartToyRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1">EnkelTrain</Typography>
            <Typography
              sx={{ color: "text.secondary", fontSize: "0.78rem", display: { xs: "none", sm: "block" } }}
            >
              Train a tiny GPT in your browser — fully local.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <BackendStatus backend={backend} />
          <Button
            variant="outlined"
            color="inherit"
            href="https://github.com/Aspenini/EnkelTrain"
            target="_blank"
            rel="noreferrer"
            startIcon={<GitHubIcon />}
            sx={{
              borderRadius: 999,
              borderColor: "divider",
              minHeight: 36,
              px: 1.75,
              fontSize: "0.82rem",
              "& .MuiButton-startIcon > *": { fontSize: 18 },
              "& .label": { display: { xs: "none", sm: "inline" } }
            }}
          >
            <span className="label">GitHub</span>
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
