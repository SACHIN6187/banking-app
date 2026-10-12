"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendMoneyApi } from "@/lib/api";

export default function SendMoneyPage() {
  const { token, account, isLoading } = useAuth();

  const [form, setForm] = useState({ toAccount: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) return setError("No account found.");

    setLoading(true);
    setError("");

    try {
      await sendMoneyApi(token!, account._id, form.toAccount, Number(form.amount));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setForm({ toAccount: "", amount: "" });
  };

  // ✅ Global loading
  if (isLoading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  // ✅ Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center p-8">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-600" />
          <h2 className="text-2xl font-semibold mb-2">Money Sent!</h2>
          <p className="text-sm mb-6">
            ₹{Number(form.amount).toLocaleString("en-IN")} sent successfully.
          </p>
          <Button onClick={handleReset}>Send Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
            <CardDescription>Transfer funds instantly</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              {/* From Account */}
              <div>
                <Label>From Account</Label>
                <div className="border p-2 rounded font-mono">
                  {account?._id || "No account"}
                </div>
              </div>

              {/* To Account */}
              <div>
                <Label>To Account</Label>
                <Input
                  name="toAccount"
                  value={form.toAccount}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <Label>Amount</Label>
                <Input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button disabled={loading || !account}>
                {loading ? "Sending..." : "Send Money"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}