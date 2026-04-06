"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Copy } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAccountApi } from "@/lib/api";

export default function DashboardPage() {
  const { token, user, account, isLoading } = useAuth();
  const [error, setError] = useState("");


  const [transactions, setTransactions] = useState<any[]>([]);

  // ✅ Sync transactions from context
  useEffect(() => {
    if (account?.transactions) {
      setTransactions(account.transactions);
    } else {
      setTransactions([]);
    }
  }, [token]);


  const isDebit = (tx: any) =>
    tx.fromAccount === account?._id ||
    tx.fromAccount?._id === account?._id;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* ✅ Account Exists */}
      {account ? (
        <div className="space-y-6 mb-6">

          {/* 💰 Balance Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-3xl p-8">
            <p className="text-sm opacity-80 mb-2">Total Balance</p>
            <p className="text-4xl font-semibold mb-4">
              ₹{account?.totalBalance?.toLocaleString("en-IN") || 0}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-lg">
                  {account._id}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(account._id)}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <Badge variant="secondary">{account.status}</Badge>
            </div>
          </div>

          {/* 📊 Credit / Debit */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Received
                </p>
                <p className="text-lg font-semibold text-emerald-600">
                  +₹{account?.creditBalance?.toLocaleString("en-IN") || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Sent
                </p>
                <p className="text-lg font-semibold text-red-500">
                  -₹{account?.debitBalance?.toLocaleString("en-IN") || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // ❌ No account → show create button
        <div className="bg-muted rounded-3xl p-8 mb-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No account found.
          </p>
          <Button asChild size="sm">
            {!account && (
              <Link href="/dashboard/create-account">
                Create Account
              </Link>
            )}
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button size="lg" asChild className="h-14 rounded-2xl">
          <Link href="/dashboard/send">
            <ArrowUpRight className="mr-2 w-5 h-5" /> Send Money
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="h-14 rounded-2xl">
          <Link href="/dashboard/transactions">
            <TrendingUp className="mr-2 w-5 h-5" /> View History
          </Link>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              No transactions yet.
            </p>
          ) : (
            transactions.map((tx, i) => {
              const debit = isDebit(tx);

              return (
                <div
                  key={tx._id}
                  className={`flex justify-between px-6 py-4 ${i !== transactions.length - 1 ? "border-b" : ""
                    }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-full ${debit ? "bg-red-50" : "bg-emerald-50"
                        }`}
                    >
                      {debit ? (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {debit ? "Sent" : "Received"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${debit ? "text-red-500" : "text-emerald-600"
                        }`}
                    >
                      {debit ? "-" : "+"}₹
                      {Number(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <Badge>{tx.status}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}