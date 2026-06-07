import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Fade from "@mui/material/Fade";
import { useEnkelTrain } from "./useEnkelTrain";
import TopBar from "./components/TopBar";
import DataCard from "./components/DataCard";
import TokenizerCard from "./components/TokenizerCard";
import ModelCard from "./components/ModelCard";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const { state, actions } = useEnkelTrain();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        minHeight: "100dvh",
        height: { xs: "auto", md: "100dvh" }
      }}
    >
      <TopBar backend={state.backend} />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "clamp(340px, 32vw, 420px) minmax(0, 1fr)" }
        }}
      >
        <Box
          component="aside"
          sx={{
            minWidth: 0,
            overflowY: { md: "auto" },
            p: { xs: 1.75, sm: 2.25 },
            borderRight: { md: "1px solid" },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: "divider",
            background: "linear-gradient(180deg, rgba(255,255,255,0.012), transparent 220px)"
          }}
        >
          <Stack spacing={1.75}>
            <Fade in timeout={400} style={{ transitionDelay: "40ms" }}>
              <div>
                <DataCard state={state} actions={actions} />
              </div>
            </Fade>
            <Fade in timeout={400} style={{ transitionDelay: "120ms" }}>
              <div>
                <TokenizerCard state={state} actions={actions} />
              </div>
            </Fade>
            <Fade in timeout={400} style={{ transitionDelay: "200ms" }}>
              <div>
                <ModelCard state={state} actions={actions} />
              </div>
            </Fade>
          </Stack>
        </Box>

        <ChatPanel state={state} actions={actions} />
      </Box>
    </Box>
  );
}
