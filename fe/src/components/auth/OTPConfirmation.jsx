// src/pages/auth/OTPConfirmation.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const OTPConfirmation = ({
	username,
	email,
	onSuccess,
	onClose,
	isPasswordReset = false,
	newPassword,
	setNewPassword,
}) => {
	const { tUI } = useTranslation();
	const { confirmSignUp, confirmPasswordReset, resendConfirmationCode } =
		useContext(AuthContext);
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const handleConfirmOtp = async e => {
		e.preventDefault();
		if (!otp.trim()) {
			setError(tUI("auth.error.otpReq"));
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
				setError(tUI("auth.error.passFormatFull"));
				setIsLoading(false);
				return;
			}
			confirmPasswordReset(
				username,
				otp,
				newPassword,
				msg => {
					setSuccess(tUI("auth.success.passReset"));
					setIsLoading(false);
					if (onSuccess) onSuccess();
				},
				err => {
					setError(err || tUI("auth.error.general"));
					setIsLoading(false);
				},
			);
		} else {
			confirmSignUp(
				username,
				otp,
				msg => {
					setSuccess(tUI("auth.success.verified"));
					setIsLoading(false);
					if (onSuccess) onSuccess();
				},
				err => {
					setError(err || tUI("auth.error.general"));
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
				setSuccess(tUI("auth.success.otpResent"));
				setIsLoading(false);
			},
			err => {
				setError(err || tUI("auth.error.resendFailed"));
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
				{tUI("auth.verifyOtpTitle")}
			</h2>
			{isPasswordReset && (
				<div className='mb-4'>
					<InputField
						label={tUI("auth.newPassLabel")}
						type='password'
						placeholder={tUI("auth.newPassPlaceholder")}
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
					placeholder={tUI("auth.otpLabel")}
					value={otp}
					onChange={e => setOtp(e.target.value)}
					disabled={isLoading}
					className='mb-6 w-full'
				/>
				<div className='flex flex-col sm:flex-row gap-4'>
					<Button
						type='submit'
						disabled={isLoading}
						className='flex-1 w-full sm:w-auto'
						iconLeft={
							isLoading && <Loader2 className='animate-spin' size={16} />
						}
					>
						{isLoading ? tUI("auth.processing") : tUI("auth.verifyBtn")}
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
						{isLoading ? tUI("auth.sending") : tUI("auth.resendBtn")}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default OTPConfirmation;
