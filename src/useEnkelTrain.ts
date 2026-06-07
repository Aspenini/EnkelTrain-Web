import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createTrainingData7z,
  createTrainingDataZip,
  documentsToCorpus,
  loadTrainingDocuments,
  type TrainingDocument
} from "./archive";
import { createSafetensorsBlob } from "./safetensors";
import { BpeTokenizer, trainBpeTokenizer } from "./tokenizer";
import { initializeBestBackend, TinyGpt, type TinyGptConfig } from "./tiny-gpt";

export type Backend = "checking" | "webgpu" | "webgl" | "cpu" | string;

export type ChatMessage = {
  id: number;
  kind: "user" | "assistant" | "system";
  text: string;
  streaming?: boolean;
};

export type ModelParams = {
  vocabSize: number;
  contextSize: number;
  dModel: number;
  layers: number;
  epochs: number;
  batchSize: number;
  steps: number;
  learningRate: number;
};

export type GenParams = {
  maxNewTokens: number;
  temperature: number;
  topK: number;
};

const DEFAULT_PARAMS: ModelParams = {
  vocabSize: 512,
  contextSize: 32,
  dModel: 64,
  layers: 1,
  epochs: 4,
  batchSize: 16,
  steps: 80,
  learningRate: 0.0015
};

const DEFAULT_GEN: GenParams = {
  maxNewTokens: 96,
  temperature: 0.8,
  topK: 20
};

const TOKENIZER_HINT = "Add data, then build a byte-level BPE tokenizer.";

function estimateParams(vocab: number, context: number, dModel: number, layers: number) {
  if (!vocab || !dModel) {
    return 0;
  }
  const embeddings = vocab * dModel + context * dModel + vocab;
  const perLayer = 12 * dModel * dModel + 9 * dModel;
  return embeddings + layers * perLayer;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

export function useEnkelTrain() {
  const [backend, setBackend] = useState<Backend>("checking");
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [hasData, setHasData] = useState(false);
  const [tokenizerReady, setTokenizerReady] = useState(false);
  const [tokenizerStats, setTokenizerStats] = useState(TOKENIZER_HINT);
  const [tokenizerTag, setTokenizerTag] = useState("");
  const [trained, setTrained] = useState(false);
  const [busy, setBusy] = useState(false);
  const [training, setTraining] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [trainingLog, setTrainingLog] = useState("Waiting for data.");
  const [progress, setProgress] = useState<number | null>(0);
  const [chatState, setChatState] = useState("Train a model first");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [gen, setGen] = useState<GenParams>(DEFAULT_GEN);

  const corpusRef = useRef("");
  const tokenizerRef = useRef<BpeTokenizer | null>(null);
  const modelRef = useRef<TinyGpt | null>(null);
  const stopRef = useRef(false);
  const summaryRef = useRef<Record<string, string>>({});
  const messageId = useRef(0);
  const logThrottle = useRef(0);

  useEffect(() => {
    let alive = true;
    void initializeBestBackend().then((value) => {
      if (alive) {
        setBackend(value);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const estimatedParams = useMemo(() => {
    const vocab = tokenizerReady ? tokenizerRef.current?.vocab.length ?? params.vocabSize : params.vocabSize;
    return estimateParams(vocab, params.contextSize, params.dModel, params.layers);
  }, [params, tokenizerReady]);

  const resetDownstream = useCallback(() => {
    tokenizerRef.current = null;
    modelRef.current = null;
    setTokenizerReady(false);
    setTrained(false);
    setTokenizerStats(TOKENIZER_HINT);
    setTokenizerTag("");
    setChatState("Train a model first");
    setProgress(0);
  }, []);

  const loadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      setDocuments([]);
      setHasData(false);
      corpusRef.current = "";
      resetDownstream();
      setTrainingLog(list.length ? "Reading files and archives..." : "No files selected.");
      setBusy(true);
      try {
        const { documents: docs, rejected } = await loadTrainingDocuments(files);
        const corpus = await documentsToCorpus(docs);
        corpusRef.current = corpus;
        setDocuments(docs);
        setHasData(corpus.length > 0);
        const rejectedText = rejected.length
          ? ` Ignored ${rejected.length} unsupported item${rejected.length === 1 ? "" : "s"}.`
          : "";
        setTrainingLog(
          corpus.length
            ? `Loaded ${docs.length} text file${docs.length === 1 ? "" : "s"} with ${corpus.length.toLocaleString()} characters.${rejectedText}`
            : `No readable text found.${rejectedText}`
        );
      } catch (error) {
        setTrainingLog(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(false);
      }
    },
    [resetDownstream]
  );

  const useSampleData = useCallback(() => {
    const sampleText = [
      "EnkelTrain runs entirely inside the browser.",
      "A tiny language model learns short patterns from local text.",
      "The tokenizer turns text into compact pieces before training.",
      "WebGPU can accelerate tensor math when the browser supports it.",
      "After training, the model writes continuations from a prompt.",
      "Local training keeps the selected data on this computer."
    ].join("\n");
    const file = new File([sampleText], "sample-training-data.txt", { type: "text/plain" });
    corpusRef.current = sampleText;
    setDocuments([{ name: file.name, path: file.name, size: file.size, file }]);
    setHasData(true);
    resetDownstream();
    setTrainingLog(`Loaded sample corpus with ${sampleText.length.toLocaleString()} characters.`);
  }, [resetDownstream]);

  const trainTokenizer = useCallback(() => {
    if (!corpusRef.current) {
      setTokenizerStats("Select text files before training a tokenizer.");
      return null;
    }
    setBusy(true);
    try {
      const { tokenizer, stats } = trainBpeTokenizer(corpusRef.current, params.vocabSize);
      tokenizerRef.current = tokenizer;
      modelRef.current = null;
      setTokenizerReady(true);
      setTrained(false);
      setTokenizerStats(
        `${stats.vocabSize} tokens · ${stats.mergeCount} merges · ${stats.pretokenCount.toLocaleString()} pretokens.`
      );
      setTokenizerTag(`${stats.vocabSize} tokens`);
      setTrainingLog("Tokenizer ready. Train the model next.");
      setChatState("Train a model first");
      setProgress(0);
      return tokenizer;
    } finally {
      setBusy(false);
    }
  }, [params.vocabSize]);

  const pushMessage = useCallback((kind: ChatMessage["kind"], text: string, streaming = false) => {
    const id = (messageId.current += 1);
    setMessages((prev) => [...prev, { id, kind, text, streaming }]);
    return id;
  }, []);

  const trainModel = useCallback(async () => {
    if (training) {
      stopRef.current = true;
      setChatState("Stopping...");
      return;
    }
    if (!corpusRef.current) {
      setTrainingLog("Select text files before training.");
      return;
    }

    let tokenizer = tokenizerRef.current;
    if (!tokenizer) {
      tokenizer = trainTokenizer();
    }
    if (!tokenizer) {
      return;
    }

    stopRef.current = false;
    setTraining(true);
    setBusy(true);
    setTrained(false);
    setChatState("Training");
    setProgress(0);

    try {
      const config: TinyGptConfig = {
        vocabSize: tokenizer.vocab.length,
        contextSize: params.contextSize,
        dModel: params.dModel,
        layers: params.layers,
        learningRate: params.learningRate
      };

      const tokenIds = tokenizer.encode(corpusRef.current);
      if (tokenIds.length < params.contextSize + 2) {
        throw new Error(
          `Need at least ${params.contextSize + 2} tokens after tokenization; add more training text or lower context.`
        );
      }

      const model = new TinyGpt(config);
      modelRef.current = model;
      const startedAt = Date.now();
      const result = await model.train(tokenIds, {
        epochs: params.epochs,
        batchSize: params.batchSize,
        stepsPerEpoch: params.steps,
        shouldStop: () => stopRef.current,
        onProgress(update) {
          const done = ((update.epoch - 1) * params.steps + update.step) / update.totalSteps;
          setProgress(done);
          const now = performance.now();
          if (now - logThrottle.current > 80 || update.step === params.steps) {
            logThrottle.current = now;
            setTrainingLog(
              `Epoch ${update.epoch}/${params.epochs} · step ${update.step}/${params.steps} · loss ${update.loss.toFixed(4)} · ${update.backend}`
            );
          }
        }
      });

      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      summaryRef.current = {
        trained_at: new Date().toISOString(),
        backend,
        final_loss: result.loss.toFixed(6),
        examples: String(result.examples),
        elapsed_seconds: elapsed
      };
      setTrained(true);
      setProgress(1);
      setTrainingLog(
        result.stopped
          ? `Stopped after ${elapsed}s. Final loss ${result.loss.toFixed(4)}.`
          : `Training complete in ${elapsed}s. Final loss ${result.loss.toFixed(4)}.`
      );
      setChatState("Ready");
      pushMessage(
        "system",
        result.stopped ? "Training stopped early — the model is still usable." : "Model trained locally and ready to run."
      );
    } catch (error) {
      setTrainingLog(error instanceof Error ? error.message : String(error));
      setChatState("Training failed");
    } finally {
      stopRef.current = false;
      setTraining(false);
      setBusy(false);
    }
  }, [training, params, backend, trainTokenizer, pushMessage]);

  const generate = useCallback(
    async (prompt: string) => {
      if (generating) {
        stopRef.current = true;
        return;
      }
      const tokenizer = tokenizerRef.current;
      const model = modelRef.current;
      if (!tokenizer || !model || !trained) {
        return;
      }
      const trimmed = prompt.trim();
      if (!trimmed) {
        return;
      }

      pushMessage("user", trimmed);
      const assistantId = pushMessage("assistant", "", true);

      stopRef.current = false;
      setGenerating(true);
      setBusy(true);
      setChatState("Generating");

      const updateAssistant = (text: string) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text } : m)));
      };

      try {
        const promptIds = tokenizer.encode(trimmed, true).slice(0, -1);
        const generated: number[] = [];
        await model.generate(
          promptIds,
          gen.maxNewTokens,
          gen.temperature,
          gen.topK,
          tokenizer.eosId,
          (tokenId) => {
            generated.push(tokenId);
            updateAssistant(tokenizer.decode(generated));
          },
          () => stopRef.current
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false, text: m.text || "(no continuation)" } : m
          )
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false, text: message } : m))
        );
      } finally {
        stopRef.current = false;
        setGenerating(false);
        setBusy(false);
        setChatState("Ready");
      }
    },
    [generating, trained, gen, pushMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const exportData = useCallback(
    async (format: "zip" | "7z") => {
      if (documents.length === 0) {
        return;
      }
      setBusy(true);
      const previous = trainingLog;
      setTrainingLog(`Creating ${format.toUpperCase()} training-data archive...`);
      try {
        const blob = format === "zip" ? await createTrainingDataZip(documents) : await createTrainingData7z(documents);
        downloadBlob(blob, `enkeltrain-training-data.${format}`);
        setTrainingLog(previous || "Training data exported.");
      } catch (error) {
        setTrainingLog(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(false);
      }
    },
    [documents, trainingLog]
  );

  const downloadModel = useCallback(() => {
    const model = modelRef.current;
    const tokenizer = tokenizerRef.current;
    if (!model || !tokenizer) {
      return;
    }
    const blob = createSafetensorsBlob(model.snapshotWeights(), model.config, tokenizer, summaryRef.current);
    downloadBlob(blob, `enkeltrain-${Date.now()}.safetensors`);
  }, []);

  return {
    state: {
      backend,
      documents,
      hasData,
      tokenizerReady,
      tokenizerStats,
      tokenizerTag,
      trained,
      busy,
      training,
      generating,
      trainingLog,
      progress,
      chatState,
      messages,
      params,
      gen,
      estimatedParams
    },
    actions: {
      loadFiles,
      useSampleData,
      trainTokenizer,
      trainModel,
      generate,
      clearChat,
      exportData,
      downloadModel,
      setParams,
      setGen
    }
  };
}

export type EnkelTrain = ReturnType<typeof useEnkelTrain>;
export type EnkelTrainState = EnkelTrain["state"];
export type EnkelTrainActions = EnkelTrain["actions"];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
