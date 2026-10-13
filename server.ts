
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Pool } from "pg";
import { z } from "zod";

const pool = new Pool({
  host: process.env.PGHOST || (process.env.NODE_ENV === "production" ? "postgres" : "localhost"),
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "sanjivani_sugar",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
});

pool.on("error", (err) => {
  console.error("[PostgreSQL Pool Error]:", err.message);
});

const server = new McpServer({
  name: "sanjivani-farmer-server",
  version: "1.0.0",
});

server.registerTool(
  "get_farmer_information",
  {
    description:
      "Retrieve farmer records, sugarcane supplied, amounts paid, pending payments, and total pending payment from PostgreSQL.",
    inputSchema: {
      question: z.string().describe("The farmer information being requested"),
    },
  },
  async ({ question }) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          village,
          sugarcane_supplied_tonnes,
          payment_pending_amount,
          amount_paid,
          CASE
            WHEN payment_pending_amount <= 0 THEN 'PAID'
            ELSE 'PENDING'
          END AS payment_status,
          SUM(payment_pending_amount) OVER () AS total_pending_payment,
          SUM(amount_paid) OVER () AS total_amount_paid,
          SUM(sugarcane_supplied_tonnes) OVER () AS total_sugarcane_supplied,
          COUNT(*) OVER () AS total_farmers
        FROM public.farmers
        ORDER BY id
      `);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              question,
              farmers: result.rows,
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Database query failed:", error);

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unable to retrieve farmer information from PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Farmer MCP server connected.");
}

async function shutdown() {
  await pool.end();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

main().catch(async (error) => {
  console.error("MCP server failed:", error);
  await pool.end();
  process.exit(1);
});
