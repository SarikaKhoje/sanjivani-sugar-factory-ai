export interface FarmerRecord {
  id: number;
  name: string;
  village: string;
  sugarcane_supplied_tonnes: number;
  payment_pending_amount: number;
  amount_paid: number;
  total_payment_value: number;
  payment_status: 'PAID' | 'PENDING';
}

export interface DashboardSummary {
  totalFarmers: number;
  totalSugarcaneSupplied: number;
  totalPendingPayments: number;
  totalAmountPaid: number;
  totalFactoryObligation: number;
  fullyPaidCount: number;
  pendingPaymentCount: number;
}

export interface VillageData {
  village: string;
  farmersCount: number;
  suppliedTonnes: number;
  pendingAmount: number;
  amountPaid: number;
}

export interface FarmersApiResponse {
  success: boolean;
  timestamp: string;
  summary: DashboardSummary;
  farmers: FarmerRecord[];
  villages: VillageData[];
  error?: string;
}

export interface AskApiResponse {
  success: boolean;
  question: string;
  answer: string;
  timestamp: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export type ActiveTab = 'dashboard' | 'farmers' | 'payments' | 'ai-assistant' | 'settings';
