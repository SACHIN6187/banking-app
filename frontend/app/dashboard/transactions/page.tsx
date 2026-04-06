"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TransactionsPage() {
  const { account, isLoading } = useAuth();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  // ✅ Sync transactions from context
  useEffect(() => {
    if (account?.transactions) {
      setTransactions(account.transactions);
    } else {
      setTransactions([]);
    }
  }, [account]);

  // ✅ Debit check
  const isDebit = (tx: any) =>
    tx.fromAccount === account?._id ||
    tx.fromAccount?._id === account?._id;

  // ✅ Filtering
  const filtered = transactions.filter((tx) => {
    const debit = isDebit(tx);

    const matchFilter =
      filter === "all" ||
      (filter === "debit" && debit) ||
      (filter === "credit" && !debit);

    const matchSearch =
      tx.fromAccount?.toString().includes(search) ||
      tx.toAccount?.toString().includes(search);

    return matchFilter && matchSearch;
  });

  const statusVariant: any = {
    Completed: "success",
    Pending: "warning",
    Failed: "destructive",
    Reversed: "outline",
  };

  // ✅ Use global loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading...
      </div>
    );
  }
  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your complete transaction history.
        </p>
      </div>

      {/* ✅ Using backend values */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-lg font-semibold text-emerald-600">
                  +₹{account?.creditBalance?.toLocaleString("en-IN") || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-lg font-semibold text-red-500">
                  -₹{account?.debitBalance?.toLocaleString("en-IN") || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by account ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
          {(["all", "credit", "debit"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {f === "credit"
                ? "Received"
                : f === "debit"
                  ? "Sent"
                  : "All"}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {filtered.length} transaction
            {filtered.length !== 1 ? "s" : ""}
          </CardTitle>
          <Filter className="w-4 h-4 text-muted-foreground" />
        </CardHeader>

        <CardContent className="p-0 mt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No transactions found.
            </div>
          ) : (
            filtered.map((tx, i) => {
              const debit = isDebit(tx);

              return (
                <div
                  key={tx._id}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition
                    ${i !== filtered.length - 1
                      ? "border-b border-border"
                      : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center
                        ${debit ? "bg-red-50" : "bg-emerald-50"}`}
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

                      <p className="text-xs text-muted-foreground font-mono">
                        {debit
                          ? `To: ${(tx.toAccount?._id || tx.toAccount || "")
                            .toString()
                            .slice(0, 16)}...`
                          : `From: ${(tx.fromAccount?._id ||
                            tx.fromAccount ||
                            "")
                            .toString()
                            .slice(0, 16)}...`}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p
                      className={`text-sm font-semibold ${debit ? "text-red-500" : "text-emerald-600"
                        }`}
                    >
                      {debit ? "-" : "+"}₹
                      {Number(tx.amount).toLocaleString("en-IN")}
                    </p>

                    <Badge variant={statusVariant[tx.status] || "outline"}>
                      {tx.status}
                    </Badge>
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