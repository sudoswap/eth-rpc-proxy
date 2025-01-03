import express, { Request, Response } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import log from "electron-log";

const app = express();
const PORT = 8546;

// RPC Endpoints
const LOCAL_NODE = "http://127.0.0.1:8545";
const MEV_NODE = "https://rpc.mevblocker.io";

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
