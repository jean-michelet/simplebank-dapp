"use client";

import { useState } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { parseError } from "@/utils/parseError";

const CONTRACT_ABI = [
  "function deposit(uint256 amount) public",
  "function withdraw(uint256 amount) public",
  "function getBalance() public view returns (uint256)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS!;

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export default function SimpleBank() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [contract, setContract] = useState<Contract | null>(null);

  const isInvalidAmount = !amount || Number(amount) <= 0;

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
  
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const user = await signer.getAddress();
  
      const bank = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const userBalance = await bank.getBalance();
  
      setAccount(user);
      setContract(bank);
      setBalance(userBalance.toString());
  
      toast.success("Wallet connected");
    } catch (error) {
      toast.error(parseError(error, "Wallet connection failed"));
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <Toaster position="top-center" />
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">🏦 Jean & Co. Bank</h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl"
          >
            Connect Metamask
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
