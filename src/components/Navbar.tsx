import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMerchant } from "@/contexts/MerchantContext";

const Navbar = () => {
  const { publicKey } = useWallet();

  const { isMerchant } = useMerchant();
  return (
    <div>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-16"
      >
        <div className="relative z-30 flex items-center gap-2">
          <img
            src="/images/blingspay_logo_mint_green.png"
            alt="BlingsPay logo"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <Link to="/">
            <span className="hidden text-xl font-bold text-foreground tracking-tight sm:inline">
              Blings<span className="text-primary">Pay</span>
            </span>
          </Link>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link to="/docs">
            <Button variant="ghost" className="sm:w-auto">
              Docs
            </Button>
          </Link>

          {publicKey && isMerchant && (
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="h-8 px-3 text-sm sm:h-9 sm:w-auto sm:px-4"
              >
                Dashboard
              </Button>
            </Link>
          )}

          {publicKey && !isMerchant && (
            <Link to="/onboarding">
              <Button className="h-8 px-3 text-sm sm:h-9 sm:w-auto sm:px-4">
                Create Merchant
              </Button>
            </Link>
          )}

          <WalletMultiButton className="!h-9 !rounded-xl !border-0 !bg-gradient-to-r !from-primary !to-accent !text-primary-foreground hover:!brightness-105" />
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
