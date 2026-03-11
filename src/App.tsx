import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Payments from "./pages/Payments";
import ApiKeys from "./pages/ApiKeys";
import Webhooks from "./pages/Webhooks";
import PosPage from "./pages/PosPage";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import CheckoutPreview from "./pages/CheckoutPreview";
import NotFound from "./pages/NotFound";
import Doc from "./pages/Doc";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

import { MerchantProvider } from "./contexts/MerchantContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

const queryClient = new QueryClient();
const endpoint = "https://api.devnet.solana.com";
const wallets = [new PhantomWalletAdapter()];

declare global {
  interface Window {
    __walletAddress: string | null;
  }
}

function WalletSync() {
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      window.__walletAddress = publicKey.toBase58();
    } else {
      window.__walletAddress = null;
    }
  }, [publicKey]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <WalletSync />
            <BrowserRouter>
              <MerchantProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/webhooks" element={<Webhooks />} />
                  <Route path="/pos" element={<PosPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route
                    path="/checkout-preview"
                    element={<CheckoutPreview />}
                  />
                  <Route path="/docs" element={<Doc />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MerchantProvider>
            </BrowserRouter>
          </TooltipProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </QueryClientProvider>
);

export default App;
