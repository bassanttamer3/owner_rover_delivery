import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { forgotPassword } from "@/api";
import type { AxiosError } from "axios";
import { ForgotPasswordInterface, LoginPath } from "@/common";

const ForgetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const { loginType } = useParams();

    const handleSubmit = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        setLoading(true);
        try {
            const data: ForgotPasswordInterface = { email };
            const response = await forgotPassword(data, loginType as LoginPath);

            toast.success(response.data.message);
            navigate("/login", { replace: true });
        } catch (err) {
            const message = (err as AxiosError<{ message?: string }>)?.response?.data?.message ?? "Something went wrong. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-cyan-100" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-10">
                <CardHeader className="text-center pb-6">
                    <img src={logo} alt="ROVEX" className="h-28 mx-auto" />
                    <div>
                        <CardDescription className="text-gray-600 text-lg">Forget Password</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-12 text-lg bg-cyan-500 hover:bg-cyan-600"
                    >
                        {loading ? "Sending..." : "Submit"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgetPassword;