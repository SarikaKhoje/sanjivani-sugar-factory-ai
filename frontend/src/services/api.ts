import { FarmersApiResponse, AskApiResponse } from '../types/farmer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetches real farmer records and factory summary statistics from the backend MCP bridge.
 */
export async function fetchFarmers(): Promise<FarmersApiResponse> {
  const response = await fetch(`${API_BASE_URL}/farmers`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to fetch farmer records (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Sends a question to the backend MCP workflow which executes tools and queries OpenAI.
 */
export async function askAI(question: string): Promise<AskApiResponse> {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to process AI question (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Checks connectivity to the backend HTTP API and MCP server.
 */
export async function checkHealth(): Promise<{ status: string; mcpConnected: boolean; model?: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}
