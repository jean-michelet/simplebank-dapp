"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import toast from "react-hot-toast";
import { parseError } from "@/utils/parseError";

export function useConnectWallet() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<Contract | null>(null);

  const connectWallet = async (
    contractAddress: string,
    contractAbi: string[]
  ) => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const user = await signer.getAddress();

      const bankContract = new Contract(contractAddress, contractAbi, signer);

      setAccount(user);
      setContract(bankContract);

      toast.success("Wallet connected");

      return bankContract
    } catch (error) {
      toast.error(parseError(error, "Wallet connection failed"));
    }
  };

  return { account, contract, connectWallet };
}
