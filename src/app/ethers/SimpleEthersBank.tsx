"use client";

import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { parseError } from "@/utils/parseError";
import { useConnectWallet } from "@/hooks/useWalletConnector";

const CONTRACT_ABI = [
  "function deposit() public payable",
  "function withdraw(uint256 amount) public payable",
  "function getBalance() public view returns (uint256)",
  "function contractBalance() public view returns (uint256)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BANK_ETHER_CONTRACT_ADDRESS!;

export default function SimpleEthersBank() {
  const { account, contract, connectWallet } = useConnectWallet();
  const [balance, setBalance] = useState("0");
  const [bankBalance, setBankBalance] = useState("0");
  const [amount, setAmount] = useState("");

  const isInvalidAmount = !amount || Number(amount) <= 0;

  const handleConnect = async () => {
    const bank = await connectWallet(CONTRACT_ADDRESS, CONTRACT_ABI);

    if (bank) {
      try {
        const userBalanceWei = await bank.getBalance();
        const userBalanceEth = ethers.formatEther(userBalanceWei);
        setBalance(userBalanceEth);

        const bankBalanceWei = await bank.contractBalance();
        const bankBalanceEth = ethers.formatEther(bankBalanceWei);
        setBankBalance(bankBalanceEth)

      } catch (error) {
        toast.error(parseError(error, "Balance retrieval failed"));
      }
    }
  };

  const handleDeposit = async () => {
    if (!contract) return;
    try {
      const valueInWei = ethers.parseEther(amount);

      const tx = await contract.deposit({ value: valueInWei });
      toast.loading("Depositing...");
      await tx.wait();

      const updatedWei = await contract.getBalance();
      const updatedEth = ethers.formatEther(updatedWei);
      setBalance(updatedEth);

      const updatedBankWei = await contract.getBalance();
      const updatedBankEth = ethers.formatEther(updatedBankWei);
      setBankBalance(updatedBankEth)

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
      const valueInWei = ethers.parseEther(amount);
      const tx = await contract.withdraw(valueInWei);
      toast.loading("Withdrawing...");
      await tx.wait();

      const updatedWei = await contract.getBalance();
      const updatedEth = ethers.formatEther(updatedWei);
      setBalance(updatedEth);

      setAmount("");
      toast.dismiss();
      toast.success("Withdrawal successful");
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
        <p className="mt-2 text-gray-700">
            <strong>Total Bank balance:</strong> {bankBalance} ETH
          </p>
          <p className="text-gray-700">
            <strong>Account:</strong>
            <br />
            <span className="break-all text-gray-900">{account}</span>
          </p>
          <p className="mt-2 text-gray-700">
            <strong>Your Bank Balance:</strong> {balance} ETH
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH (0.0001 <= amount <= 0.001)"
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
            Please enter a valid amount greater than 0.
          </p>
        )}
      </div>
    </>
  );
}
