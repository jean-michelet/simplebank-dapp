"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { parseError } from "@/utils/parseError";
import { useConnectWallet } from "@/hooks/useWalletConnector";

const CONTRACT_ABI = [
  "function deposit(uint256 amount) public",
  "function withdraw(uint256 amount) public",
  "function getBalance() public view returns (uint256)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS!;

export default function SimpleIntegersBank() {
  const { account, contract, connectWallet } = useConnectWallet();
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");

  const isInvalidAmount = !amount || Number(amount) <= 0;

  const handleConnect = async () => {
    const bank = await connectWallet(CONTRACT_ADDRESS, CONTRACT_ABI);
    if (bank) {
      try {
        const userBalance = await bank.getBalance();

        setBalance(userBalance.toString());
      } catch (error) {
        toast.error(parseError(error, "Balance retrieval failed"));
      }
    }
  };

  const handleDeposit = async () => {
    if (!contract) return;
    try {
      const tx = await contract.deposit(Number(amount));
      toast.loading("Depositing...");
      await tx.wait();
      const updated = await contract.getBalance();
      setBalance(updated.toString());
      setAmount("");
      toast.dismiss();
      toast.success("Deposit successful");
    } catch (error: unknown) {
      toast.dismiss();
      toast.error(parseError(error, "Deposit failed"));
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;
    try {
      const tx = await contract.withdraw(Number(amount));
      toast.loading("Withdrawing...");
      await tx.wait();
      const updated = await contract.getBalance();
      setBalance(updated.toString());
      setAmount("");
      toast.dismiss();
      toast.success("Withdraw successful");
    } catch (error: unknown) {
      toast.dismiss();
      toast.error(parseError(error, "Withdraw failed"));
    }
  };

  if (!account) {
    return (
      <button
        onClick={handleConnect}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl"
      >
        Connect Metamask
      </button>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-sm">
          <p className="text-gray-700">
            <strong>Account:</strong>
            <br />
            <span className="break-all text-gray-900">{account}</span>
          </p>
          <p className="mt-2 text-gray-700">
            <strong>Balance:</strong> {balance} units
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex gap-3 justify-between">
          <button
            onClick={handleDeposit}
            disabled={isInvalidAmount}
            className={`flex-1 py-2 rounded-lg font-medium ${
              isInvalidAmount
                ? "bg-green-300 cursor-not-allowed text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Deposit
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isInvalidAmount}
            className={`flex-1 py-2 rounded-lg font-medium ${
              isInvalidAmount
                ? "bg-red-300 cursor-not-allowed text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Withdraw
          </button>
        </div>
        {isInvalidAmount && (
          <p className="text-red-500 text-sm font-medium mb-1">
            Please enter a positive amount greater than 0.
          </p>
        )}
      </div>
    </>
  );
}
