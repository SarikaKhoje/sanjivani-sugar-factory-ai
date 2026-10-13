import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Scale,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Factory,
  LayoutDashboard,
  Settings as SettingsIcon,
} from 'lucide-react';
import { ActiveTab, FarmerRecord, DashboardSummary, VillageData } from './types/farmer';
import { fetchFarmers } from './services/api';
import { formatCurrency, formatTonnes, formatNumber } from './utils/formatters';

import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { SummaryCard } from './components/SummaryCard';
import { SugarcaneSupplyChart } from './components/SugarcaneSupplyChart';
import { PaymentComparisonChart } from './components/PaymentComparisonChart';
import { PaymentStatusDonutChart } from './components/PaymentStatusDonutChart';
import { VillagePerformanceChart } from './components/VillagePerformanceChart';
import { FarmerRecordsTable } from './components/FarmerRecordsTable';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { FarmerDetailModal } from './components/FarmerDetailModal';
import { SettingsPanel } from './components/SettingsPanel';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);
  const [aiPrefilledQuestion, setAiPrefilledQuestion] = useState<string>('');

  // Load farmer data from backend API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFarmers();
      if (data.success) {
        setFarmers(data.farmers);
        setSummary(data.summary);
        setVillages(data.villages);
      } else {
        throw new Error(data.error || 'Failed to retrieve records.');
      }
    } catch (err: any) {
      console.error('Failed to load farmer data:', err);
      setError(
        err.message ||
          'Unable to connect to Sanjivani API Bridge. Please ensure the backend is running on port 5000.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle asking AI about a specific farmer
  const handleAskAIAboutFarmer = (farmerName: string) => {
    setAiPrefilledQuestion(
      `Please provide a detailed status report for farmer ${farmerName}, including sugarcane supplied, amount paid, and pending payment.`
    );
    setActiveTab('ai-assistant');
  };

  // If user types in top search and hits Enter, navigate to Farmer Records view
  const handleSearchSubmit = () => {
    if (activeTab !== 'farmers') {
      setActiveTab('farmers');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNav
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pendingCount={summary?.pendingPaymentCount || 8}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Global Connection Error Banner */}
        {error && (
          <div className="m-4 sm:m-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Backend API Bridge Offline</h4>
                <p className="text-xs text-amber-800/90 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Welcome Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Factory Management Dashboard
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Real-time cane deliveries and financial settlement intelligence
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="p-2 text-slate-600 hover:text-forest-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-assistant')}
                    className="px-3.5 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-lime-400 group-hover:rotate-12 transition-transform" />
                    <span>Open AI Assistant</span>
                  </button>
                </div>
              </div>

              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                  title="Total Farmers"
                  value={summary ? formatNumber(summary.totalFarmers) : '—'}
                  subtitle="Active registered growers"
                  icon={<Users className="w-6 h-6" />}
                  iconBgColor="bg-forest-50"
                  iconTextColor="text-forest-800"
                  trendText="100% Verified"
                  trendColor="text-forest-800 bg-forest-50 border-forest-200"
                />

                <SummaryCard
                  title="Sugarcane Supplied"
                  value={summary ? formatTonnes(summary.totalSugarcaneSupplied) : '—'}
                  subtitle="Total factory intake"
                  icon={<Scale className="w-6 h-6" />}
                  iconBgColor="bg-forest-50"
                  iconTextColor="text-forest-800"
                  trendText="Season 25-26"
                  trendColor="text-forest-800 bg-forest-50 border-forest-200"
                />

                <SummaryCard
                  title="Total Pending Payments"
                  value={summary ? formatCurrency(summary.totalPendingPayments) : '—'}
                  subtitle={`${summary?.pendingPaymentCount || 0} farmers pending`}
                  icon={<Clock className="w-6 h-6" />}
                  iconBgColor="bg-amber-50"
                  iconTextColor="text-amber-700"
                  trendText="Needs Settlement"
                  trendColor="text-amber-800 bg-amber-50 border-amber-200"
                />

                <SummaryCard
                  title="Total Amount Paid"
                  value={summary ? formatCurrency(summary.totalAmountPaid) : '—'}
                  subtitle={`${summary?.fullyPaidCount || 0} fully settled accounts`}
                  icon={<IndianRupee className="w-6 h-6" />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-700"
                  trendText="Disbursed"
                  trendColor="text-emerald-800 bg-emerald-50 border-emerald-200"
                />
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SugarcaneSupplyChart farmers={farmers} />
                </div>
                <div>
                  <PaymentStatusDonutChart summary={summary} />
                </div>
              </div>

              {/* Quick Deliveries Overview & Table Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cane Deliveries Directory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Recent records with instant sorting and payment status
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('farmers')}
                    className="text-xs font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1.5 group"
                  >
                    <span>View All Records ({farmers.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <FarmerRecordsTable
                  farmers={farmers}
                  isLoading={isLoading}
                  error={error}
                  onRetry={loadData}
                  onSelectFarmer={(f) => setSelectedFarmer(f)}
                  onAskAIAboutFarmer={handleAskAIAboutFarmer}
                  initialSearchQuery={searchQuery}
                />
              </div>
            </div>
          )}

          {/* TAB 2: FARMER RECORDS */}
          {activeTab === 'farmers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Farmer Records
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Complete registry of sugarcane growers and payment ledgers
                  </p>
                </div>
              </div>

              <FarmerRecordsTable
                farmers={farmers}
                isLoading={isLoading}
                error={error}
                onRetry={loadData}
                onSelectFarmer={(f) => setSelectedFarmer(f)}
                onAskAIAboutFarmer={handleAskAIAboutFarmer}
                initialSearchQuery={searchQuery}
              />
            </div>
          )}

          {/* TAB 3: PAYMENT OVERVIEW */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Payment Intelligence &amp; Settlements
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Disbursement tracking, outstanding obligations, and village breakdowns
                  </p>
                </div>
              </div>

              {/* Financial Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Cane Obligation
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {summary ? formatCurrency(summary.totalFactoryObligation) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Combined value of all cane delivered this season
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Disbursed Amount
                    </span>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {summary && summary.totalFactoryObligation > 0
                        ? `${Math.round((summary.totalAmountPaid / summary.totalFactoryObligation) * 100)}%`
                        : '87%'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {summary ? formatCurrency(summary.totalAmountPaid) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Settled to grower accounts via direct bank transfer
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Pending Clearance
                    </span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {summary && summary.totalFactoryObligation > 0
                        ? `${Math.round((summary.totalPendingPayments / summary.totalFactoryObligation) * 100)}%`
                        : '13%'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {summary ? formatCurrency(summary.totalPendingPayments) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Awaiting next scheduled fortnightly payment batch
                  </p>
                </div>
              </div>

              {/* Payment Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentComparisonChart farmers={farmers} />
                <VillagePerformanceChart villages={villages} />
              </div>

              <div>
                <PaymentStatusDonutChart summary={summary} />
              </div>
            </div>
          )}

          {/* TAB 4: AI ASSISTANT */}
          {activeTab === 'ai-assistant' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  AI Farmer Assistant
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Natural language inquiries powered by Model Context Protocol (MCP) and OpenAI
                </p>
              </div>

              <AIAssistantPanel
                initialQuestion={aiPrefilledQuestion}
                onQuestionConsumed={() => setAiPrefilledQuestion('')}
              />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Settings &amp; Factory Diagnostics
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Sugar factory configuration, database parameters, and MCP diagnostics
                </p>
              </div>

              <SettingsPanel />
            </div>
          )}
        </main>
      </div>

      {/* Farmer Detail Modal */}
      <FarmerDetailModal
        farmer={selectedFarmer}
        onClose={() => setSelectedFarmer(null)}
        onAskAIAboutFarmer={handleAskAIAboutFarmer}
      />

      {/* Mobile Bottom Navigation Bar (visible only on mobile/tablet < lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around shadow-elevated">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'text-forest-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'dashboard' ? 'bg-forest-100 text-forest-900' : ''}`}>
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
            activeTab === 'farmers'
              ? 'text-forest-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'farmers' ? 'bg-forest-100 text-forest-900' : ''}`}>
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>Farmers</span>
          {summary && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
            activeTab === 'payments'
              ? 'text-forest-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'payments' ? 'bg-forest-100 text-forest-900' : ''}`}>
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>Payments</span>
          {summary && summary.pendingPaymentCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai-assistant')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
            activeTab === 'ai-assistant'
              ? 'text-forest-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'ai-assistant' ? 'bg-forest-900 text-lime-400' : 'text-slate-600'}`}>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>AI Chat</span>
          <span className="absolute top-1 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
            activeTab === 'settings'
              ? 'text-forest-900 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'settings' ? 'bg-forest-100 text-forest-900' : ''}`}>
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
