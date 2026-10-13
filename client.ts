
import "dotenv/config";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const question =
  "Which farmers have pending payments, how much sugarcane has each supplied in tonnes, and what is the total pending payment?";

async function main() {
  const mcp = new Client({
    name: "sanjivani-farmer-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
      "server.ts",
    ],
  });

  try {
    await mcp.connect(transport);

    // Discover tools provided by the MCP server.
    const { tools } = await mcp.listTools();

    const farmerTool = tools.find(
      (tool) => tool.name === "get_farmer_information"
    );

    if (!farmerTool) {
      throw new Error("Farmer information tool was not found.");
    }

    // Convert the discovered MCP tool into an OpenAI function tool.
    const openAITools = [
      {
        type: "function" as const,
        name: farmerTool.name,
        description: farmerTool.description ?? "Get farmer information",
        parameters: farmerTool.inputSchema as any,
        strict: false,
      },
    ];

    // Ask OpenAI to decide how to use the tool.
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
      input: question,
      tools: openAITools,
      tool_choice: "required",
    });

    const call = response.output.find(
      (item) => item.type === "function_call"
    );

    if (!call || call.type !== "function_call") {
      console.log(response.output_text);
      return;
    }

    if (call.name !== farmerTool.name) {
      throw new Error(`Unexpected tool requested: ${call.name}`);
    }

    // Execute the requested tool through MCP.
    const args = JSON.parse(call.arguments);
    const toolResult = await mcp.callTool({
      name: call.name,
      arguments: args,
    });

    if (toolResult.isError) {
      const errorMessage = Array.isArray(toolResult.content)
        ? toolResult.content
            .map((item: unknown) => {
              if (
                typeof item === "object" &&
                item !== null &&
                "type" in item &&
                item.type === "text" &&
                "text" in item &&
                typeof item.text === "string"
              ) {
                return item.text;
              }
              return undefined;
            })
            .filter((text): text is string => typeof text === "string")
            .join("\n")
        : "";
      throw new Error(
        `MCP tool ${call.name} failed${errorMessage ? `: ${errorMessage}` : "."}`
      );
    }

    // Send the real MCP result back to OpenAI.
    const finalResponse = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
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

    console.log("\nQuestion:", question);
    console.log("\nAI Answer:\n", finalResponse.output_text);
  } finally {
    await mcp.close();
  }
}

main().catch((error) => {
  console.error("Application failed:", error);
  process.exitCode = 1;
});
