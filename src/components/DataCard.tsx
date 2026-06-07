import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Grow from "@mui/material/Grow";
import Fade from "@mui/material/Fade";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { alpha } from "@mui/material/styles";
import StepCard from "./StepCard";
import { formatBytes } from "../format";
import { brand } from "../theme";
import type { EnkelTrainActions, EnkelTrainState } from "../useEnkelTrain";

const ACCEPT =
  ".txt,.md,.markdown,.csv,.json,.jsonl,.html,.xml,.js,.ts,.tsx,.jsx,.py,.rs,.go,.java,.c,.cpp,.h,.hpp,.css,.scss,.sql,.yaml,.yml,.toml,.ini,.log,.zip,.7z,application/zip,application/x-7z-compressed";

type Props = { state: EnkelTrainState; actions: EnkelTrainActions };

export default function DataCard({ state, actions }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const idle = !state.busy;
  const hasFiles = state.documents.length > 0;

  return (
    <StepCard step={1} title="Training data" tag={`${state.documents.length} file${state.documents.length === 1 ? "" : "s"}`} done={state.hasData}>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer?.files?.length) {
            void actions.loadFiles(event.dataTransfer.files);
          }
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          textAlign: "center",
          minHeight: 110,
          p: 2,
          cursor: "pointer",
          borderRadius: 2.5,
          border: "1.5px dashed",
          borderColor: dragging ? brand.emerald : "#3a4452",
          bgcolor: dragging ? alpha(brand.emerald, 0.07) : brand.panel2,
          color: "text.secondary",
          transform: dragging ? "scale(1.012)" : "scale(1)",
          transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
          "&:hover": { borderColor: brand.blue, bgcolor: brand.elevated }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          hidden
          onChange={(event) => {
            if (event.target.files?.length) {
              void actions.loadFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
        <CloudUploadOutlinedIcon sx={{ fontSize: 30, color: brand.blue, mb: 0.5 }} />
        <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.92rem" }}>
          Drop files or browse
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.4, maxWidth: "32ch" }}>
          Text, Markdown, code, CSV, JSON, logs, plus ZIP &amp; 7z archives.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25 }}>
        <Button variant="outlined" color="inherit" size="small" disabled={!idle} onClick={actions.useSampleData}>
          Sample data
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={!idle || !hasFiles}
          onClick={() => void actions.exportData("zip")}
        >
          Export .zip
        </Button>
      </Box>
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        disabled={!idle || !hasFiles}
        onClick={() => void actions.exportData("7z")}
      >
        Export .7z
      </Button>

      <Collapse in={hasFiles} timeout={280} unmountOnExit>
        <Stack spacing={0.75} sx={{ maxHeight: 168, overflowY: "auto", pr: 0.25 }}>
          {state.documents.map((doc, index) => (
            <Grow in appear timeout={260} key={`${doc.path}-${index}`} style={{ transitionDelay: `${Math.min(index, 8) * 30}ms` }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 34,
                  px: 1.25,
                  borderRadius: 1.5,
                  bgcolor: brand.panel2,
                  border: "1px solid",
                  borderColor: brand.lineSoft,
                  fontSize: "0.82rem"
                }}
              >
                <Typography
                  title={doc.path}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem" }}
                >
                  {doc.path}
                </Typography>
                <Typography sx={{ flex: "none", color: brand.faint, fontSize: "0.78rem" }}>
                  {formatBytes(doc.size)}
                </Typography>
              </Stack>
            </Grow>
          ))}
        </Stack>
      </Collapse>

      <Fade in={!hasFiles} timeout={240} unmountOnExit>
        <Box
          sx={{
            p: "10px 12px",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            color: brand.faint,
            fontSize: "0.82rem"
          }}
        >
          No files loaded yet.
        </Box>
      </Fade>
    </StepCard>
  );
}
