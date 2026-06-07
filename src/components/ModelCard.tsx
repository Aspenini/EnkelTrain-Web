import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NumberField from "./NumberField";
import StepCard from "./StepCard";
import { brand } from "../theme";
import { formatCount, type EnkelTrainActions, type EnkelTrainState } from "../useEnkelTrain";

type Props = { state: EnkelTrainState; actions: EnkelTrainActions };

export default function ModelCard({ state, actions }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const idle = !state.busy;
  const { params } = state;
  const set = (patch: Partial<typeof params>) => actions.setParams((prev) => ({ ...prev, ...patch }));

  return (
    <StepCard step={3} title="Model" tag={`~${formatCount(state.estimatedParams)} params`} done={state.trained}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25 }}>
        <NumberField label="Context" value={params.contextSize} min={8} max={96} step={8} disabled={!idle} onChange={(v) => set({ contextSize: v })} />
        <NumberField label="Width" value={params.dModel} min={24} max={160} step={8} disabled={!idle} onChange={(v) => set({ dModel: v })} />
        <NumberField label="Layers" value={params.layers} min={1} max={3} step={1} disabled={!idle} onChange={(v) => set({ layers: v })} />
        <NumberField label="Epochs" value={params.epochs} min={1} max={20} step={1} disabled={!idle} onChange={(v) => set({ epochs: v })} />
      </Box>

      <Box sx={{ borderTop: "1px solid", borderColor: brand.lineSoft, pt: 1.25 }}>
        <ButtonBase
          onClick={() => setAdvanced((open) => !open)}
          sx={{
            color: brand.muted,
            fontSize: "0.78rem",
            fontWeight: 600,
            gap: 0.5,
            borderRadius: 1,
            justifyContent: "flex-start",
            width: "fit-content"
          }}
        >
          <ChevronRightRoundedIcon
            sx={{ fontSize: 18, transition: "transform 180ms ease", transform: advanced ? "rotate(90deg)" : "none" }}
          />
          Advanced training
        </ButtonBase>
        <Collapse in={advanced} timeout={260} unmountOnExit>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25 }}>
              <NumberField label="Batch" value={params.batchSize} min={4} max={64} step={4} disabled={!idle} onChange={(v) => set({ batchSize: v })} />
              <NumberField label="Steps / epoch" value={params.steps} min={10} max={1000} step={10} disabled={!idle} onChange={(v) => set({ steps: v })} />
            </Box>
            <NumberField label="Learning rate" value={params.learningRate} min={0.0001} max={0.01} step={0.0001} disabled={!idle} onChange={(v) => set({ learningRate: v })} />
          </Stack>
        </Collapse>
      </Box>

      <Button
        variant={state.training ? "outlined" : "contained"}
        color={state.training ? "error" : "primary"}
        disabled={state.training ? false : !idle || !state.hasData}
        onClick={() => void actions.trainModel()}
      >
        {state.training ? "Stop training" : "Train model"}
      </Button>

      <LinearProgress
        variant={state.progress === null ? "indeterminate" : "determinate"}
        value={state.progress === null ? undefined : Math.min(100, Math.max(0, state.progress * 100))}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: "#0c0f15",
          "& .MuiLinearProgress-bar": { borderRadius: 999, background: brand.gradient }
        }}
      />

      <Typography sx={{ color: brand.muted, fontSize: "0.8rem", lineHeight: 1.45, minHeight: "1.45em" }}>
        {state.trainingLog}
      </Typography>

      <Button
        variant="outlined"
        color="inherit"
        startIcon={<DownloadRoundedIcon />}
        disabled={!idle || !state.trained}
        onClick={actions.downloadModel}
      >
        Download .safetensors
      </Button>
    </StepCard>
  );
}
