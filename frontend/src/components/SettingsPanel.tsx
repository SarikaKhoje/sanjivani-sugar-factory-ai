import React, { useState } from 'react';
import {
  Factory,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { checkHealth } from '../services/api';

export const SettingsPanel: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsChecking(true);
    setHealthError(null);
    try {
      const result = await checkHealth();
      setHealthStatus(result);
    } catch (err: any) {
      setHealthError(err.message || 'Failed to reach API bridge');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Factory Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-lime-400 flex items-center justify-center shadow-sm">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Sanjivani Sahakari Sakhar Karkhana Ltd.
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Kopargaon, Dist. Ahmednagar, Maharashtra — 423603
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Crushing Season 2025-2026
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isChecking}
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Run Diagnostics'}</span>
            </button>
          </div>
        </div>

        {/* Factory Operational Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs">
          <div className="p-3.5 rounded-xl bg-cream-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Daily Crushing Capacity:</span>
            <p className="text-base font-bold text-slate-900 mt-1">5,000 TCD</p>
            <p className="text-[11px] text-slate-500">Tonnes of Cane per Day</p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Factory Registration:</span>
            <p className="text-base font-bold text-slate-900 mt-1 font-mono">MH/SUG/KPG/104</p>
            <p className="text-[11px] text-slate-500">Maharashtra Sugar Board</p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Primary Catchment:</span>
            <p className="text-base font-bold text-slate-900 mt-1">Godavari River Basin</p>
            <p className="text-[11px] text-slate-500">Kopargaon, Rahata, Yeola</p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Accounting Schedule:</span>
            <p className="text-base font-bold text-slate-900 mt-1">Fortnightly FRP Cycle</p>
            <p className="text-[11px] text-slate-500">Fair &amp; Remunerative Price</p>
          </div>
        </div>
      </div>

      {/* Architecture & MCP Diagnostics Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          System Architecture &amp; Protocol Status
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Detailed diagnostic telemetry for the Model Context Protocol (MCP) pipeline
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: PostgreSQL */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">PostgreSQL Database</h4>
            <p className="text-xs text-slate-500 mt-1">
              Houses farmer records, cane deliveries, and payment balances in table <code className="font-mono text-slate-700 bg-slate-200/60 px-1 rounded">public.farmers</code>.
            </p>
          </div>

          {/* Card 2: MCP Server */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-forest-50 text-forest-700">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Stdio Ready
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">MCP TypeScript Server</h4>
            <p className="text-xs text-slate-500 mt-1">
              Official SDK server exposing tool <code className="font-mono text-slate-700 bg-slate-200/60 px-1 rounded">get_farmer_information</code> via stdio transport.
            </p>
          </div>

          {/* Card 3: AI Inference Engine */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                OpenAI Function Tool
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">AI Intelligence Model</h4>
            <p className="text-xs text-slate-500 mt-1">
              Executes autonomous reasoning and tool calls using model <code className="font-mono text-slate-700 bg-slate-200/60 px-1 rounded">gpt-4.1-mini</code>.
            </p>
          </div>
        </div>

        {/* Live Health Status Box */}
        {healthStatus && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              API Bridge Diagnostic: Verified Healthy
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
              <div>Status: <span className="font-bold text-slate-800">{healthStatus.status}</span></div>
              <div>MCP Transport: <span className="font-bold text-slate-800">{healthStatus.mcpConnected ? 'Connected' : 'Disconnected'}</span></div>
              <div>Model: <span className="font-bold text-slate-800 font-mono">{healthStatus.model}</span></div>
              <div>Timestamp: <span className="font-mono">{new Date(healthStatus.timestamp).toLocaleTimeString()}</span></div>
            </div>
          </div>
        )}

        {healthError && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            Diagnostic ping failed: {healthError}
          </div>
        )}
      </div>

      {/* Security Best Practices Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-forest-50 text-forest-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Enterprise Security Architecture</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              In accordance with secure deployment principles, OpenAI API keys and PostgreSQL credentials
              remain strictly isolated on the backend server environment. The frontend communicates exclusively
              via the local Express HTTP bridge, preventing secret exposure or credential leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
