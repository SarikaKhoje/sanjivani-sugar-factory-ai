import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";
import { Pool } from "pg";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Singleton MCP Client connection manager
class McpBridgeService {
  private mcpClient: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connectingPromise: Promise<Client> | null = null;

  async getClient(): Promise<Client> {
    if (this.mcpClient) {
      return this.mcpClient;
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = (async () => {
      console.log("[MCP Bridge] Spawning MCP Server process via stdio...");
      const client = new Client({
        name: "sanjivani-express-bridge",
        version: "1.0.0",
      });

      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [
          join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
          "server.ts",
        ],
      });

      await client.connect(transport);
      console.log("[MCP Bridge] MCP Server connected successfully via stdio.");

      this.mcpClient = client;
      this.transport = transport;
      this.connectingPromise = null;
      return client;
    })().catch((err) => {
      this.connectingPromise = null;
      this.mcpClient = null;
      throw err;
    });

    return this.connectingPromise;
  }

  async callFarmerTool(question: string = "Dashboard Data Query") {
    const client = await this.getClient();
    const result = await client.callTool({
      name: "get_farmer_information",
      arguments: { question },
    });

    if (result.isError) {
      const errMsg = Array.isArray(result.content)
        ? result.content.map((c: any) => c.text).filter(Boolean).join("\n")
        : "MCP tool execution failed";
      throw new Error(errMsg);
    }

    const textContent = Array.isArray(result.content)
      ? result.content.find((c: any) => c.type === "text")?.text
      : undefined;

    if (!textContent) {
      throw new Error("No text content returned from MCP tool.");
    }

    return JSON.parse(textContent);
  }

  async askAI(question: string): Promise<string> {
    const client = await this.getClient();
    const { tools } = await client.listTools();

    const farmerTool = tools.find((t) => t.name === "get_farmer_information");
    if (!farmerTool) {
      throw new Error("get_farmer_information tool not found on MCP server.");
    }

    const openAITools = [
      {
        type: "function" as const,
        name: farmerTool.name,
        description: farmerTool.description ?? "Get farmer information",
        parameters: farmerTool.inputSchema as any,
        strict: false,
      },
    ];

    // Request decision from OpenAI model
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: question,
      tools: openAITools,
      tool_choice: "auto",
    });

    const call = response.output.find((item) => item.type === "function_call");

    // If model answered directly without tool call
    if (!call || call.type !== "function_call") {
      return response.output_text || "No response received.";
    }

    if (call.name !== farmerTool.name) {
      throw new Error(`Unexpected tool call requested: ${call.name}`);
    }

    // Call tool through MCP
    const args = JSON.parse(call.arguments);
    const toolResult = await client.callTool({
      name: call.name,
      arguments: args,
    });

    if (toolResult.isError) {
      const errMsg = Array.isArray(toolResult.content)
        ? toolResult.content.map((c: any) => c.text).filter(Boolean).join("\n")
        : "MCP tool error";
      throw new Error(`MCP tool execution error: ${errMsg}`);
    }

    // Send tool output back to OpenAI
    const finalResponse = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [
        {
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(toolResult),
        },
      ],
      previous_response_id: response.id,
      tools: openAITools,
    });

    return finalResponse.output_text || "No response returned from model.";
  }

  async disconnect() {
    if (this.mcpClient) {
      await this.mcpClient.close();
      this.mcpClient = null;
      this.transport = null;
    }
  }
}

const mcpService = new McpBridgeService();

// Health Check Endpoint
app.get("/api/health", async (_req, res) => {
  try {
    const client = await mcpService.getClient();
    const { tools } = await client.listTools();
    res.json({
      status: "ok",
      mcpConnected: true,
      toolsDiscovered: tools.map((t) => t.name),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to connect to MCP server",
    });
  }
});

// Farmers Data & Summary Statistics Endpoint
app.get("/api/farmers", async (_req, res) => {
  try {
    const mcpData = await mcpService.callFarmerTool("Get all factory farmer records and pending payment details");
    const rawFarmers = mcpData.farmers || [];

    // Parse numeric fields safely
    const farmers = rawFarmers.map((f: any) => {
      const tonnes = parseFloat(f.sugarcane_supplied_tonnes) || 0;
      const pending = parseFloat(f.payment_pending_amount) || 0;
      const paid = parseFloat(f.amount_paid) || 0;
      const totalAmount = pending + paid;
      return {
        id: Number(f.id),
        name: String(f.name),
        village: String(f.village),
        sugarcane_supplied_tonnes: tonnes,
        payment_pending_amount: pending,
        amount_paid: paid,
        total_payment_value: totalAmount,
        payment_status: pending <= 0 ? "PAID" : "PENDING",
      };
    });

    // Calculate verified summary statistics from real database records
    const totalFarmers = farmers.length;
    const totalSugarcaneSupplied = farmers.reduce(
      (sum: number, f: any) => sum + f.sugarcane_supplied_tonnes,
      0
    );
    const totalPendingPayments = farmers.reduce(
      (sum: number, f: any) => sum + f.payment_pending_amount,
      0
    );
    const totalAmountPaid = farmers.reduce(
      (sum: number, f: any) => sum + f.amount_paid,
      0
    );
    const fullyPaidCount = farmers.filter((f: any) => f.payment_status === "PAID").length;
    const pendingPaymentCount = farmers.filter((f: any) => f.payment_status === "PENDING").length;

    // Village-wise aggregation
    const villageMap: Record<string, { village: string; farmersCount: number; suppliedTonnes: number; pendingAmount: number; amountPaid: number }> = {};
    for (const f of farmers) {
      if (!villageMap[f.village]) {
        villageMap[f.village] = {
          village: f.village,
          farmersCount: 0,
          suppliedTonnes: 0,
          pendingAmount: 0,
          amountPaid: 0,
        };
      }
      villageMap[f.village].farmersCount += 1;
      villageMap[f.village].suppliedTonnes += f.sugarcane_supplied_tonnes;
      villageMap[f.village].pendingAmount += f.payment_pending_amount;
      villageMap[f.village].amountPaid += f.amount_paid;
    }
    const villages = Object.values(villageMap);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalFarmers,
        totalSugarcaneSupplied: Number(totalSugarcaneSupplied.toFixed(2)),
        totalPendingPayments: Number(totalPendingPayments.toFixed(2)),
        totalAmountPaid: Number(totalAmountPaid.toFixed(2)),
        totalFactoryObligation: Number((totalPendingPayments + totalAmountPaid).toFixed(2)),
        fullyPaidCount,
        pendingPaymentCount,
      },
      farmers,
      villages,
    });
  } catch (error: any) {
    console.error("[API Error /api/farmers]:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch farmer records from MCP/database.",
    });
  }
});

// AI Question Endpoint
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      success: false,
      error: "Question parameter is required and must be a non-empty string.",
    });
  }

  try {
    console.log(`[API /api/ask] Received question: "${question.trim()}"`);
    const answer = await mcpService.askAI(question.trim());
    console.log(`[API /api/ask] Generated answer successfully.`);
    res.json({
      success: true,
      question: question.trim(),
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API Error /api/ask]:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing question through MCP and AI.",
    });
  }
});

const serverInstance = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 Sanjivani AI - HTTP API Bridge running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/farmers`);
  console.log(`   - POST http://localhost:${PORT}/api/ask`);
  console.log(`=======================================================`);
});

const shutdown = async () => {
  console.log("\n[API Bridge] Shutting down server gracefully...");
  serverInstance.close();
  await mcpService.disconnect();
  process.exit(0);
};

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
