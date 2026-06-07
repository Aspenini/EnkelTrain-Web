import { useLayoutEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Grow from "@mui/material/Grow";
import Fade from "@mui/material/Fade";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { keyframes } from "@mui/material/styles";
import NumberField from "./NumberField";
import { brand } from "../theme";
import type { ChatMessage, EnkelTrainActions, EnkelTrainState } from "../useEnkelTrain";

const blink = keyframes`50% { opacity: 0; }`;

type Props = { state: EnkelTrainState; actions: EnkelTrainActions };

export default function ChatPanel({ state, actions }: Props) {
  const [prompt, setPrompt] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const idle = !state.busy;
  const canSend = state.generating || (idle && state.trained);

  useLayoutEffect(() => {
    const el = logRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [state.messages]);

  const submit = () => {
    if (state.generating) {
      void actions.generate("");
      return;
    }
    const value = prompt;
    setPrompt("");
    void actions.generate(value);
  };

  return (
    <Box
      component="main"
      sx={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: { xs: "72vh", md: 0 } }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", px: { xs: 2, sm: 2.75 }, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h2" sx={{ fontSize: "0.98rem" }}>
          Local chat
        </Typography>
        <ChatStateChip label={state.chatState} />
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" color="inherit" size="small" disabled={!idle} onClick={actions.clearChat}>
          Clear
        </Button>
      </Stack>

      <Box
        ref={logRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
          p: { xs: 2, sm: "22px clamp(16px, 4vw, 48px)" }
        }}
      >
        {state.messages.length === 0 ? (
          <EmptyHero />
        ) : (
          state.messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          px: { xs: 2, sm: "clamp(16px, 4vw, 48px)" },
          py: 1.75,
          bgcolor: "rgba(12, 15, 21, 0.55)"
        }}
      >
        <Stack spacing={1.25} sx={{ maxWidth: 860, mx: "auto" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "flex-end",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "#0c0f15",
              p: "6px 6px 6px 16px",
              transition: "border-color 140ms ease, box-shadow 140ms ease",
              "&:focus-within": {
                borderColor: brand.blue,
                boxShadow: `0 0 0 3px ${"rgba(96, 165, 250, 0.14)"}`
              }
            }}
          >
            <InputBase
              multiline
              maxRows={8}
              fullWidth
              value={prompt}
              placeholder="Prompt your trained model..."
              disabled={state.busy && !state.generating}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              sx={{
                fontSize: "0.92rem",
                lineHeight: 1.5,
                p: 0,
                "& .MuiInputBase-input": { p: 0, py: "9px" }
              }}
            />
            <IconButton
              onClick={submit}
              disabled={!canSend}
              aria-label={state.generating ? "Stop" : "Run"}
              sx={{
                width: 40,
                height: 40,
                flex: "none",
                borderRadius: 2.5,
                color: state.generating ? brand.danger : "#06121b",
                background: state.generating ? "rgba(248, 113, 113, 0.14)" : brand.gradient,
                border: state.generating ? "1px solid rgba(248,113,113,0.45)" : "1px solid transparent",
                transition: "filter 140ms ease, background 140ms ease",
                "&:hover": { filter: "brightness(1.06)", background: state.generating ? "rgba(248, 113, 113, 0.22)" : brand.gradient },
                "&.Mui-disabled": { background: brand.elevated, color: brand.faint }
              }}
            >
              {state.generating ? <StopRoundedIcon /> : <ArrowForwardRoundedIcon />}
            </IconButton>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.25 }}>
            <NumberField label="New tokens" value={state.gen.maxNewTokens} min={8} max={256} step={8} disabled={state.generating} onChange={(v) => actions.setGen((p) => ({ ...p, maxNewTokens: v }))} />
            <NumberField label="Temperature" value={state.gen.temperature} min={0.1} max={2} step={0.1} disabled={state.generating} onChange={(v) => actions.setGen((p) => ({ ...p, temperature: v }))} />
            <NumberField label="Top K" value={state.gen.topK} min={1} max={80} step={1} disabled={state.generating} onChange={(v) => actions.setGen((p) => ({ ...p, topK: v }))} />
          </Box>

          <Typography sx={{ textAlign: "center", color: brand.faint, fontSize: "0.72rem" }}>
            <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function ChatStateChip({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.375,
        borderRadius: 999,
        bgcolor: brand.panel2,
        border: "1px solid",
        borderColor: "divider",
        color: "text.secondary",
        fontSize: "0.74rem",
        fontWeight: 600,
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </Box>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.kind === "system") {
    return (
      <Fade in appear timeout={300}>
        <Typography sx={{ width: "100%", textAlign: "center", color: brand.faint, fontSize: "0.82rem", py: 0.5 }}>
          {message.text}
        </Typography>
      </Fade>
    );
  }

  const isUser = message.kind === "user";
  return (
    <Grow in appear timeout={260} style={{ transformOrigin: isUser ? "bottom right" : "bottom left" }}>
      <Box
        sx={{
          width: "fit-content",
          maxWidth: "min(720px, 86%)",
          px: 1.875,
          py: 1.5,
          lineHeight: 1.55,
          fontSize: "0.92rem",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          borderRadius: 3.5,
          alignSelf: isUser ? "flex-end" : "flex-start",
          ...(isUser
            ? { background: brand.gradient, color: "#06121b", borderBottomRightRadius: 6, fontWeight: 500 }
            : { bgcolor: brand.panel, border: "1px solid", borderColor: "divider", borderBottomLeftRadius: 6 })
        }}
      >
        {message.text}
        {message.streaming ? (
          <Box component="span" sx={{ ml: "1px", color: brand.emerald, animation: `${blink} 1s steps(2) infinite` }}>
            ▍
          </Box>
        ) : null}
      </Box>
    </Grow>
  );
}

function EmptyHero() {
  return (
    <Fade in appear timeout={500}>
      <Stack spacing={1.5} sx={{ alignItems: "center", m: "auto", maxWidth: 440, textAlign: "center", color: brand.muted }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 58,
            height: 58,
            borderRadius: 4,
            background: brand.gradient,
            color: "#06121b",
            boxShadow: "0 16px 40px -18px rgba(94, 234, 212, 0.7)"
          }}
        >
          <SmartToyRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography sx={{ color: "text.primary", fontSize: "1.1rem", fontWeight: 700 }}>
          Your private little language model
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
          Load some text, train the tokenizer and model on the left, then chat with the model you just trained — nothing
          leaves your device.
        </Typography>
      </Stack>
    </Fade>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        fontSize: "0.68rem",
        px: 0.75,
        py: "1px",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: brand.panel2,
        color: "text.secondary"
      }}
    >
      {children}
    </Box>
  );
}
