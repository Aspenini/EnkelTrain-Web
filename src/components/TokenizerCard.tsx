import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NumberField from "./NumberField";
import StepCard from "./StepCard";
import { brand } from "../theme";
import type { EnkelTrainActions, EnkelTrainState } from "../useEnkelTrain";

type Props = { state: EnkelTrainState; actions: EnkelTrainActions };

export default function TokenizerCard({ state, actions }: Props) {
  const idle = !state.busy;

  return (
    <StepCard step={2} title="Tokenizer" tag={state.tokenizerTag} done={state.tokenizerReady}>
      <NumberField
        label="Vocabulary size"
        value={state.params.vocabSize}
        min={260}
        max={2048}
        step={16}
        disabled={!idle}
        onChange={(value) => actions.setParams((prev) => ({ ...prev, vocabSize: value }))}
      />
      <Button
        variant="outlined"
        color="inherit"
        disabled={!idle || !state.hasData}
        onClick={() => actions.trainTokenizer()}
      >
        Train tokenizer
      </Button>
      <Typography sx={{ color: brand.muted, fontSize: "0.8rem", lineHeight: 1.45 }}>
        {state.tokenizerStats}
      </Typography>
    </StepCard>
  );
}
