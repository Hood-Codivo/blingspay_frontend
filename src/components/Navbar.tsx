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
        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-16"
      >
        <div className="flex items-center gap-2">
          <img
            src="/images/blingspay_logo_mint_green.png"
            alt="BlingsPay logo"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <Link to="/">
            <span className="text-xl font-bold text-foreground tracking-tight">
              Blings<span className="text-primary">Pay</span>
            </span>
          </Link>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Link to="/docs">
            <Button variant="ghost" className="w-full sm:w-auto">
              Docs
            </Button>
          </Link>

          {publicKey && isMerchant && (
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full sm:w-auto">
                Dashboard
              </Button>
            </Link>
          )}

          {publicKey && !isMerchant && (
            <Link to="/onboarding">
              <Button className="w-full sm:w-auto">Create Merchant</Button>
            </Link>
          )}

          <WalletMultiButton className="!h-9 !rounded-xl !bg-primary !text-primary-foreground" />
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
