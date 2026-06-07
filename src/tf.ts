// Centralised TensorFlow.js setup with a deterministic backend import order.
//
// The base package (core + CPU + WebGL) is loaded first so its environment
// flags are registered, then the WebGPU backend — it reads some core/WebGL
// flags at module-evaluation time, so they must already exist.
import "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";
import * as tf from "@tensorflow/tfjs";

export { tf };
