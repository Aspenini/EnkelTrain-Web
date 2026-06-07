import TextField from "@mui/material/TextField";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export default function NumberField({ label, value, onChange, min, max, step, disabled }: Props) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      sx={{ minWidth: 0 }}
      value={Number.isFinite(value) ? value : ""}
      disabled={disabled}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === "") {
          return;
        }
        const next = Number(raw);
        if (!Number.isNaN(next)) {
          onChange(next);
        }
      }}
      slotProps={{
        htmlInput: { min, max, step },
        inputLabel: { shrink: true }
      }}
    />
  );
}
