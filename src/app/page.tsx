import PageLayout from "@/ui/PageLayout";
import Link from "next/link";

export default function Home() {
  return (
    <PageLayout title="🏦 Jean & Co. Bank welcomes you">
        <div className="space-x-4">
          <Link
            href="/integers"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            Integers Bank
          </Link>
          <Link
            href="/ethers"
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            Ethers Bank
          </Link>
        </div>
    </PageLayout>
  );
}
