import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { resetPassword } from "@/api";
import type { AxiosError } from "axios";
import { LoginPath, ResetPasswordInterface } from "@/common";

const RestPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");
    const [new_password, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginType } = useParams();


    const handleSubmit = async () => {
        if (!new_password) {
            toast.error("Please enter your new password");
            return;
        }

        if (!token || !user_id) {
            return;
        }
        setLoading(true);
        try {
            const data: ResetPasswordInterface = { token, user_id, new_password };
            // console.log(data);

            const response = await resetPassword(loginType as LoginPath, data);
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
            <Card className="w-full max-w-md mx-4 sm:mx-auto shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                    <img src={logo} alt="ROVEX" className="h-28 mx-auto" />
                    <div>
                        <CardDescription className="text-lg">Reset Password</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            placeholder="Enter your new password"
                            value={new_password}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-12"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </CardContent>
            </Card>
    );
};

export default RestPassword;