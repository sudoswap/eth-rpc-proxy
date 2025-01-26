import express, { Request, Response } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import log from "electron-log";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// RPC Endpoints
const LOCAL_NODE = process.env.LOCAL_NODE;
const MEV_NODE = process.env.MEV_NODE;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://zoo-ui.vercel.app",
    "https://zoo.fun",
    /^https:\/\/.*\.zoo\.fun$/,
  ],
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
};

// May be necessary for cors to work correctly
// https://cloud.google.com/appengine/docs/standard/nodejs/runtime#https_and_forwarding_proxies
app.set("trust proxy", true);

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Handle JSON-RPC requests
app.post("/", async (req: Request, res: Response) => {
  const jsonRpcBody = req.body;

  // Ensure request is valid JSON-RPC
  if (!jsonRpcBody || !jsonRpcBody.method) {
    log.error("Invalid JSON-RPC request received");
    return res.status(400).json({ error: "Invalid JSON-RPC request" });
  }

  // Log the transaction type (method)
  log.info(`Transaction type: ${jsonRpcBody.method}`);

  // Determine target based on method
  const target =
    jsonRpcBody.method === "eth_sendTransaction" ||
    jsonRpcBody.method === "eth_sendRawTransaction"
      ? MEV_NODE
      : LOCAL_NODE;

  // Log where the request is being routed
  log.info(`Routing request to: ${target}`);

  if (!target) {
    log.error("Target RPC endpoint is not defined");
    return res
      .status(500)
      .json({ error: "Target RPC endpoint is not defined" });
  }

  try {
    // Forward the request to the target RPC
    const response = await axios.post(target, jsonRpcBody, {
      headers: { "Content-Type": "application/json" },
    });

    // Add header to indicate which endpoint was used
    res.setHeader("X-RPC-Endpoint", target);

    // Log successful response
    log.info(`Request successfully processed via ${target}`);

    // Send the response back to the client
    res.status(response.status).json(response.data);
  } catch (error: unknown) {
    const err = error as Error;
    log.error(`Error forwarding request to ${target}: ${err.message}`);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Ethereum JSON-RPC proxy running on http://127.0.0.1:${PORT}`);
});
