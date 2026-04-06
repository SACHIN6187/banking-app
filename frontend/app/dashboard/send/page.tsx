"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAccountApi, sendMoneyApi } from "@/lib/api";

export default function SendMoneyPage() {
  const { token } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [form, setForm] = useState({ toAccount: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getAccountApi(token).then((data) => setAccount(data.account || data)).catch(() => { });
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleReset = () => { setSuccess(false); setForm({ toAccount: "", amount: "" }); };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center p-8 shadow-xl rounded-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Money Sent!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            ₹{Number(form.amount).toLocaleString("en-IN")} sent successfully.
          </p>
          <Button onClick={handleReset} className="w-full" size="lg">Send Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-muted/40 to-muted/10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Send Money</h1>
          <p className="text-muted-foreground text-sm mt-1">Transfer funds instantly and securely</p>
        </div>

        <Card className="shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> New Transfer
            </CardTitle>
            <CardDescription>Enter transfer details below</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>From Account</Label>
                <div className="flex h-11 w-full rounded-xl border bg-muted px-4 text-sm font-mono items-center shadow-sm">
                  {account?._id || "Loading..."}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account ID</Label>
                <Input
                  id="toAccount"
                  name="toAccount"
                  placeholder="Enter recipient account ID"
                  value={form.toAccount}
                  onChange={handleChange}
                  className="font-mono h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="pl-8 h-11"
                    required
                    min="1"
                  />
                </div>
              </div>

              {form.toAccount && form.amount && (
                <div className="bg-muted rounded-xl p-4 text-sm animate-fade-in shadow-inner">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-mono text-xs truncate max-w-[160px]">{form.toAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₹{Number(form.amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={loading || !account}
              >
                {loading ? "Processing..." : "Send Money"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}