import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
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
        className="flex items-center justify-between px-6 py-5 lg:px-16"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <Link to="/">
            <span className="text-xl font-bold text-foreground tracking-tight">
              Blings<span className="text-primary">Pay</span>
            </span>
          </Link>
        </div>
        <div className="flex justify-end p-4 gap-3">
          {publicKey && isMerchant && (
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          )}

          {publicKey && !isMerchant && (
            <Link to="/onboarding">
              <Button>Create Merchant</Button>
            </Link>
          )}

          <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-xl !h-9" />
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
