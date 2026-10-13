# 🌾 Sanjivani AI — Smart Farmer Information & Payment Intelligence

An interactive, responsive dashboard and Model Context Protocol (MCP) system built for **Sanjivani Sahakari Sakhar Karkhana Ltd. (Kopargaon Sugar Factory)**. 

The application integrates PostgreSQL database records, an official stdio Model Context Protocol (MCP) server, an Express HTTP API bridge, OpenAI function calling, and a modern React + Vite frontend styled with Tailwind CSS, Lucide icons, and Recharts.

---

## 🏛 System Architecture

A web browser cannot communicate directly with a stdio-based MCP process. To bridge this, a secure local Express API bridge translates HTTP requests from the React frontend into MCP tool invocations and OpenAI agent workflows.

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite Frontend                 │
│              (Port 5173 / Tailwind / Recharts)         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON (CORS / Proxy)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Express HTTP API Bridge (Port 5000)        │
│                    `api-bridge.ts`                     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ Stdio Client Transport   │ OpenAI Responses API
               ▼                          ▼
┌──────────────────────────────┐   ┌─────────────────────┐
│      MCP TypeScript Server   │   │   OpenAI gpt-4o-mini│
│          `server.ts`         │   │   Function Calling  │
│  (Tool: get_farmer_info)     │   └─────────────────────┘
└──────────────┬───────────────┘
               │ Pool Query
               ▼
┌──────────────────────────────┐
│     PostgreSQL Database      │
│     Table: `public.farmers`  │
└──────────────────────────────┘
```

---

## 🚀 Key Features

1. **Executive Sugar Factory Dashboard**
   - KPI Summary Cards: Total Farmers (10), Total Sugarcane Supplied (1,207.25 Tonnes), Total Pending Payments (₹1,19,000), Total Amount Paid (₹7,98,000).
   - Formatted in Indian Rupees (`en-IN` locale) and metric tonnes.
   - Quick preview of top deliveries with 1-click modal inspect.

2. **Interactive Visual Analytics (Recharts)**
   - **Sugarcane Supplied by Farmer**: Bar chart showing metric tonnes per grower with percentage contribution tooltips.
   - **Payment Comparison**: Grouped bar chart comparing amounts paid (Green) vs pending payments (Amber) per farmer.
   - **Payment Status Overview**: Donut chart with toggle between grower count ratio (20% paid vs 80% pending) and monetary valuation ratio.
   - **Village Catchment Performance**: Regional intake comparing Kopargaon, Rahata, Yeola, Shirdi, Sakuri, and Loni.

3. **Searchable, Sortable Farmer Records Directory**
   - Instant search across Farmer Name and Village.
   - Multi-field sorting: Sugarcane volume, Pending amount, Paid amount, ID, and Name (Ascending / Descending).
   - Filter by payment status: All / Fully Paid / Pending Payment.
   - Live summary totals for filtered records.
   - Loading skeletons, empty search states, and error recovery buttons.

4. **MCP AI Assistant Chat Panel**
   - Real-time natural language query answering powered by `server.ts` stdio tool execution.
   - Markdown rendered answers with lists, bold text, and currency formatting.
   - 6 Quick suggested question chips:
     1. *Which farmers have pending payments?*
     2. *Who supplied the most sugarcane?*
     3. *What is the total pending payment?*
     4. *Show farmers from Kopargaon.*
     5. *Compare payments across villages.*
     6. *Summarize the overall farmer payment status.*
   - Pre-filled AI queries from farmer records ("Ask AI about [Farmer]").

5. **Factory Settings & Diagnostics**
   - Live diagnostic ping to verify PostgreSQL pool and stdio MCP discovery.
   - Sugar factory profile (5,000 TCD Crushing Capacity, Season 2025–26, Kopargaon).
   - Security verification guaranteeing zero API keys or DB credentials leak to the browser.

---

## 📦 Tech Stack

- **Frontend**: React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend API Bridge**: Express 5, CORS, TypeScript, tsx
- **MCP Server & Client**: `@modelcontextprotocol/sdk` (StdioServerTransport & StdioClientTransport)
- **Database**: PostgreSQL (`pg` driver)
- **AI Model**: OpenAI Responses API with tool calling

---

## 🛠 Prerequisites

1. **Node.js** (v18.x or later)
2. **PostgreSQL** instance running locally or on a remote server
3. **OpenAI API Key**

---

## ⚙️ Installation & Setup

### Step 1: Clone & Install Root Backend Dependencies

Open a terminal in the project root:

```bash
cd sanjivani-mcp
npm install
```

### Step 2: Configure Environment Variables

Create your `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Ensure your `.env` contains your PostgreSQL credentials and OpenAI key:

```env
PORT=5000

OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini

PGHOST=localhost
PGPORT=5432
PGDATABASE=sanjivani_sugar
PGUSER=postgres
PGPASSWORD=your_postgres_password
```

### Step 3: Initialize Database Records (If not already set up)

Run the SQL script against your PostgreSQL database:

```bash
psql -U postgres -d sanjivani_sugar -f database.sql
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🏃 Running the Application

You will run the backend API bridge and the frontend in **two separate terminal windows**.

### Terminal 1: Start the Backend HTTP API Bridge

From the root directory:

```bash
npm run api
```

*Output:*
```
🌾 Sanjivani AI - HTTP API Bridge running on port 5000
📡 Endpoints:
   - GET  http://localhost:5000/api/health
   - GET  http://localhost:5000/api/farmers
   - POST http://localhost:5000/api/ask
```

*(Optional) You can still test the standalone CLI MCP client at any time:*
```bash
npm run mcp:client
```

### Terminal 2: Start the React + Vite Frontend

In a second terminal window:

```bash
cd frontend
npm run dev
```

*Output:*
```
  VITE v6.0.7  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Diagnostic check verifying MCP tool discovery and model readiness |
| `GET` | `/api/farmers` | Retrieves all farmer records and computed factory summary statistics via MCP |
| `POST` | `/api/ask` | Accepts `{"question": "..."}`, executes MCP tool via OpenAI, and returns verified answer |

### Example `POST /api/ask` Request:

```json
{
  "question": "Which farmers have pending payments?"
}
```

### Example Response:

```json
{
  "success": true,
  "question": "Which farmers have pending payments?",
  "answer": "The farmers who have pending payments are:\n1. Rahul Shinde from Kopargaon (Pending: ₹15,000)\n2. Amit Jadhav from Yeola (Pending: ₹8,000)\n...",
  "timestamp": "2026-10-13T08:09:25.997Z"
}
```

---

## 🔒 Security Best Practices

- All database connections and OpenAI API calls occur strictly within the Node.js backend.
- Neither PostgreSQL passwords nor OpenAI API keys are exposed to the client bundle or Vite variables.
- All frontend calls route through `http://localhost:5000/api` via Vite's secure proxy.
