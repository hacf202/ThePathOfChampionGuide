// src/pages/auth/OTPConfirmation.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const OTPConfirmation = ({
	username,
	email,
	onSuccess,
	onClose,
	isPasswordReset = false,
	newPassword,
	setNewPassword,
}) => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
	const { confirmSignUp, confirmPasswordReset, resendConfirmationCode } =
		useContext(AuthContext);
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const handleConfirmOtp = async e => {
		e.preventDefault();
		if (!otp.trim()) {
			setError(
				language === "vi" ? "Vui lòng nhập mã OTP" : "Please enter OTP code",
			);
			return;
		}
		setIsLoading(true);
		setError(null);

		if (isPasswordReset) {
			if (
				!newPassword ||
				newPassword.length < 8 ||
				!/[0-9]/.test(newPassword) ||
				!/[a-zA-Z]/.test(newPassword)
			) {
				setError(
					language === "vi"
						? "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ và số"
						: "New password must be at least 8 characters, including letters and numbers",
				);
				setIsLoading(false);
				return;
			}
			confirmPasswordReset(
				username,
				otp,
				newPassword,
				msg => {
					setSuccess(
						language === "vi"
							? "Đổi mật khẩu thành công!"
							: "Password reset successful!",
					);
					setIsLoading(false);
					if (onSuccess) onSuccess();
				},
				err => {
					setError(
						err || (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"),
					);
					setIsLoading(false);
				},
			);
		} else {
			confirmSignUp(
				username,
				otp,
				msg => {
					setSuccess(
						language === "vi"
							? "Xác minh thành công!"
							: "Verification successful!",
					);
					setIsLoading(false);
					if (onSuccess) onSuccess();
				},
				err => {
					setError(
						err || (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"),
					);
					setIsLoading(false);
				},
			);
		}
	};

	const handleResendOtp = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);
		resendConfirmationCode(
			username,
			msg => {
				setSuccess(
					language === "vi"
						? "Đã gửi lại mã OTP vào email của bạn"
						: "OTP code has been resent to your email",
				);
				setIsLoading(false);
			},
			err => {
				setError(
					err ||
						(language === "vi"
							? "Không thể gửi lại mã"
							: "Failed to resend code"),
				);
				setIsLoading(false);
			},
		);
	};

	return (
		<div className='p-6 max-w-sm mx-auto'>
			{error && (
				<div className='mb-4 p-3 bg-danger-500/10 border border-danger-500 text-danger-500 rounded-md text-sm'>
					{error}
				</div>
			)}
			{success && (
				<div className='mb-4 p-3 bg-success/10 border border-success text-success rounded-md text-sm'>
					{success}
				</div>
			)}

			<h2 className='text-2xl font-bold mb-6 text-text-primary text-center font-primary'>
				{language === "vi" ? "Xác Minh OTP" : "Verify OTP"}
			</h2>
			{isPasswordReset && (
				<div className='mb-4'>
					<InputField
						label={language === "vi" ? "Mật khẩu mới:" : "New password:"}
						type='password'
						placeholder={
							language === "vi" ? "Nhập mật khẩu mới" : "Enter new password"
						}
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
						disabled={isLoading}
						className='w-full'
					/>
				</div>
			)}
			<form onSubmit={handleConfirmOtp}>
				<InputField
					type='text'
					placeholder={language === "vi" ? "Mã OTP" : "OTP Code"}
					value={otp}
					onChange={e => setOtp(e.target.value)}
					disabled={isLoading}
					className='mb-6 w-full'
				/>
				<div className='flex flex-col sm:flex-row gap-4'>
					{" "}
					{/* Responsive buttons */}
					<Button
						type='submit'
						disabled={isLoading}
						className='flex-1 w-full sm:w-auto'
						iconLeft={
							isLoading && <Loader2 className='animate-spin' size={16} />
						}
					>
						{isLoading
							? language === "vi"
								? "Đang xử lý..."
								: "Processing..."
							: language === "vi"
								? "Xác Minh"
								: "Verify"}
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={handleResendOtp}
						disabled={isLoading}
						className='flex-1 w-full sm:w-auto'
						iconLeft={
							isLoading && <Loader2 className='animate-spin' size={16} />
						}
					>
						{isLoading
							? language === "vi"
								? "Đang gửi..."
								: "Sending..."
							: language === "vi"
								? "Gửi Lại OTP"
								: "Resend OTP"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default OTPConfirmation;
