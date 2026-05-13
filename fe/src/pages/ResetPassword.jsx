
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import InputField from "../components/common/inputField";
import Button from "../components/common/button";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Supabase sets the session in the URL fragment. 
    // The AuthContext should pick it up automatically if it's listening to onAuthStateChange.
    // Let's ensure the user is "logged in" by the time they reach here.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        try {
            // Since the user is authenticated by clicking the link, 
            // we can call a simplified change password that doesn't need the old one,
            // OR use the Supabase SDK directly if we add a method for it.
            
            // For now, let's assume we use the changePassword from context but we might need 
            // a version that doesn't require the old password for this specific flow.
            // Actually, we'll add a new method `resetPassword` to AuthContext.
            
            await resetPassword(newPassword); 
            setIsSuccess(true);
            setTimeout(() => navigate("/"), 3000);
        } catch (err) {
            setError(err.message || "Không thể đặt lại mật khẩu. Link có thể đã hết hạn.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-surface-bg p-8 rounded-2xl border border-border shadow-xl">
                {isSuccess ? (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle2 size={64} className="text-success" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Thành công!</h2>
                        <p className="text-text-secondary">
                            Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển về trang chủ trong giây lát.
                        </p>
                        <Button onClick={() => navigate("/")} className="w-full">
                            Về trang chủ ngay
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-2 text-center font-primary">
                            Đặt lại mật khẩu
                        </h2>
                        <p className="text-text-secondary text-sm text-center mb-8">
                            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <InputField
                                label="Mật khẩu mới"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Ít nhất 8 ký tự"
                                disabled={isLoading}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-text-secondary"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <InputField
                                label="Xác nhận mật khẩu"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isLoading}
                            />

                            {error && (
                                <p className="text-danger-500 text-xs bg-danger-500/10 p-2 rounded border border-danger-500/20">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                iconLeft={isLoading && <Loader2 className="animate-spin" size={18} />}
                            >
                                {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
