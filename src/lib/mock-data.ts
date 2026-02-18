export type PaymentRecord = {
  id: string;
  txSignature: string;
  amount: number;
  fee: number;
  token: "SOL" | "USDC" | "USDT";
  status: "confirmed" | "pending" | "failed";
  customer: string;
  timestamp: number;
};

export type MerchantAPIKey = {
  id: string;
  publicKey: string;
  secretKey: string;
  label: string;
  active: boolean;
  createdAt: Date;
  lastUsed: Date | null;
};

export type WebhookEndpoint = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
};

const now = Date.now();
const day = 86400000;

export const mockPayments: PaymentRecord[] = [
  { id: "pay_1a2b3c", txSignature: "5Xk9...qR7m", amount: 149.99, fee: 1.50, token: "USDC", status: "confirmed", customer: "0x8f2...a1c", timestamp: now - day * 0.1 },
  { id: "pay_4d5e6f", txSignature: "3Lp2...vN8k", amount: 0.85, fee: 0.0085, token: "SOL", status: "confirmed", customer: "0x3b7...e9d", timestamp: now - day * 0.5 },
  { id: "pay_7g8h9i", txSignature: "9Wm4...tJ2p", amount: 500.00, fee: 5.00, token: "USDC", status: "confirmed", customer: "0xc4a...b2f", timestamp: now - day * 1 },
  { id: "pay_jk1l2m", txSignature: "2Rn6...yK3q", amount: 75.50, fee: 0.76, token: "USDT", status: "pending", customer: "0x9e1...d7a", timestamp: now - day * 1.5 },
  { id: "pay_3n4o5p", txSignature: "7Hs8...mQ1w", amount: 1200.00, fee: 12.00, token: "USDC", status: "confirmed", customer: "0x2f6...c8b", timestamp: now - day * 2 },
  { id: "pay_6q7r8s", txSignature: "4Vt1...pL9n", amount: 2.30, fee: 0.023, token: "SOL", status: "failed", customer: "0xa5d...f3e", timestamp: now - day * 3 },
  { id: "pay_9t0u1v", txSignature: "8Bx3...sG5r", amount: 89.99, fee: 0.90, token: "USDC", status: "confirmed", customer: "0x7c2...a4g", timestamp: now - day * 4 },
  { id: "pay_2w3x4y", txSignature: "1Dz7...uH6t", amount: 320.00, fee: 3.20, token: "USDT", status: "confirmed", customer: "0xe8f...b1c", timestamp: now - day * 5 },
];

export const mockApiKeys: MerchantAPIKey[] = [
  { id: "key_1", publicKey: "pk_live_4a8f2c1b9e7d3f6a0b5c8d2e1f4a7b9c", secretKey: "sk_live_9c7b4a1f2e8d3c6b0a5f8d2e1c4b7a9f", label: "Production", active: true, createdAt: new Date(now - day * 30), lastUsed: new Date(now - day * 0.1) },
  { id: "key_2", publicKey: "pk_test_7d3f6a0b5c8d2e1f4a8f2c1b9e4b7a9c", secretKey: "sk_test_0a5f8d2e1c4b7a9f9c7b4a1f2e8d3c6b", label: "Test / Sandbox", active: true, createdAt: new Date(now - day * 15), lastUsed: new Date(now - day * 2) },
];

export const mockWebhooks: WebhookEndpoint[] = [
  { id: "wh_1", url: "https://mystore.com/api/webhook", events: ["payment.completed", "payment.failed"], active: true, createdAt: new Date(now - day * 20) },
];

export const revenueData = [
  { date: "Jan", sol: 12.5, usdc: 4200, usdt: 1800 },
  { date: "Feb", sol: 18.2, usdc: 5800, usdt: 2100 },
  { date: "Mar", sol: 15.0, usdc: 7200, usdt: 3500 },
  { date: "Apr", sol: 22.8, usdc: 9100, usdt: 4200 },
  { date: "May", sol: 28.5, usdc: 11500, usdt: 5800 },
  { date: "Jun", sol: 35.2, usdc: 14200, usdt: 6900 },
];

export const merchantStats = {
  totalRevenue: 48250.00,
  totalFees: 482.50,
  totalTransactions: 342,
  successRate: 97.8,
  vaultBalance: 12480.00,
  pendingWithdrawals: 1250.00,
};
