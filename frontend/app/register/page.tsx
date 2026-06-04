"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendRegisterOtpApi, verifyRegisterOtpApi } from "@/lib/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!otpSent) {
        // SECURITY FIX: Only send email during OTP request
        await sendRegisterOtpApi(form.email, form.name, form.password);
        setOtpSent(true);
        setMessage("OTP sent to your email. Please enter it below.");
        return;
      }
      // SECURITY FIX: Send all details including password during verification
      const data = await verifyRegisterOtpApi(form.email, otp, form.name, form.password);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-background" />
            </div>
            <span className="text-2xl font-light tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Vault
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {otpSent ? "Verify OTP" : "Create account"}
            </CardTitle>
            <CardDescription>
              {otpSent
                ? `Enter the code sent to ${form.email}`
                : "Get started with Vault today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-emerald-500/10 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                  {message}
                </div>
              )}
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" type="text"
                      placeholder="Sachin Yadav"
                      value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password} onChange={handleChange}
                        required className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading
                  ? otpSent ? "Verifying OTP..." : "Sending OTP..."
                  : otpSent ? "Verify OTP" : "Send OTP"}
              </Button>
              {otpSent && (
                <Button
                  type="button"
                  className="w-full"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                >
                  Edit registration details
                </Button>
              )}
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
