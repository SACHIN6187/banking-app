"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, PlusCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { createAccountApi } from "@/lib/api";

export default function CreateAccountPage() {
  const { token, account, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading...
      </div>
    );
  }

  // ✅ Create account
  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      await createAccountApi(token!);
      window.location.reload(); // (optional: can improve later)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ If account exists → show UI
  if (account) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="p-6 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <CardTitle className="text-xl">Your Account</CardTitle>
            <CardDescription>
              Your bank account is active and ready 🚀
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 mt-4">
            {/* Balance */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-5">
              <p className="text-xs opacity-80 mb-1">Total Balance</p>
              <h2 className="text-2xl font-semibold">
                ₹{account.totalBalance.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Credit / Debit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Received</p>
                <p className="text-sm font-semibold text-emerald-600">
                  +₹{account.creditBalance.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Sent</p>
                <p className="text-sm font-semibold text-red-500">
                  -₹{account.debitBalance.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Account ID */}
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase">
                Account ID
              </p>

              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm break-all">
                  {account._id}
                </span>

                <button
                  onClick={() => navigator.clipboard.writeText(account._id)}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="success">{account.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ No account → create UI
  return (
    <div className="max-w-md animate-fade-in">
      <h1 className="text-2xl font-semibold mb-4">Create Account</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Button onClick={handleCreate} className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </div>
  );
}