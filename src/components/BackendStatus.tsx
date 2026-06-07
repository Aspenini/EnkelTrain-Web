import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { keyframes } from "@mui/material/styles";
import type { Backend } from "../useEnkelTrain";
import { brand } from "../theme";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--dot-glow); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

const COLORS: Record<string, { color: string; glow: string; label: string }> = {
  webgpu: { color: brand.emerald, glow: "rgba(52, 211, 153, 0.45)", label: "WebGPU" },
  webgl: { color: brand.warn, glow: "rgba(251, 191, 36, 0.45)", label: "WebGL" },
  cpu: { color: "#fb923c", glow: "rgba(251, 146, 60, 0.45)", label: "CPU" },
  checking: { color: brand.faint, glow: "transparent", label: "checking" }
};

export default function BackendStatus({ backend }: { backend: Backend }) {
  const info = COLORS[backend] ?? { color: brand.faint, glow: "transparent", label: backend };
  const animated = backend !== "checking";

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        height: 36,
        px: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 999,
        bgcolor: brand.panel2,
        color: "text.secondary",
        fontSize: "0.8rem",
        whiteSpace: "nowrap"
      }}
    >
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: 999,
          bgcolor: info.color,
          "--dot-glow": info.glow,
          animation: animated ? `${pulse} 2.4s ease-in-out infinite` : "none"
        }}
      />
      <span>{info.label}</span>
    </Stack>
  );
}
