"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { checkSystemUserApi, generateFundApi } from "@/lib/api";

export default function GenerateFundPage() {
    const { account, token } = useAuth();
    const [amount, setAmount] = useState("0");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isSystemUser, setIsSystemUser] = useState(false);
    useEffect(() => {
        if (!token) return;
        checkSystemUserApi(token)
            .then((res) => setIsSystemUser(res.isSystemUser))
            .catch(() => setIsSystemUser(false));
    }, [token]);
    
    if (!isSystemUser) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-red-500">Access denied</p>
            </div>
        );
    }

    const handleGenerate = async () => {
        setLoading(true);
        setError("");

        try {
            await generateFundApi(token!, account!._id, Number(amount));
            setSuccess(true);
            setAmount("");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Success screen
    if (success) {
        return (
            <div className="max-w-md mx-auto mt-20">
                <Card className="text-center p-6">
                    <CheckCircle2 className="mx-auto mb-3 text-emerald-600 w-8 h-8" />
                    <CardTitle>Funds Generated</CardTitle>
                    <CardDescription className="mt-1">
                        Amount added successfully 🎉
                    </CardDescription>

                    <Button className="mt-4" onClick={() => setSuccess(false)}>
                        Generate Again
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 animate-fade-in">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Generate Funds
                    </CardTitle>
                    <CardDescription>
                        Add money to your account (System only)
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                        <div className="text-sm font-mono break-all border p-2 rounded">
                            {account?._id}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleGenerate}
                        disabled={loading || !amount}
                    >
                        {loading ? "Processing..." : "Generate Fund"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}