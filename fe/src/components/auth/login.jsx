// src/pages/auth/Login.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const Login = ({ onSwitchToRegister, onSuccess }) => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
	const { login, forgotPassword, confirmPasswordReset } =
		useContext(AuthContext);
	const navigate = useNavigate();

	// === Đăng nhập ===
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loginErrors, setLoginErrors] = useState({
		username: "",
		password: "",
	});

	// === Quên mật khẩu ===
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [forgotStep, setForgotStep] = useState(1);
	const [forgotUsername, setForgotUsername] = useState("");
	const [forgotEmail, setForgotEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
	const [forgotErrors, setForgotErrors] = useState({
		username: "",
		email: "",
		otp: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState("");

	// === Validate (chỉ khi submit) ===
	const validateLogin = () => {
		const err = { username: "", password: "" };
		if (!username.trim())
			err.username =
				language === "vi" ? "Vui lòng nhập tài khoản" : "Please enter username";
		if (!password)
			err.password =
				language === "vi" ? "Vui lòng nhập mật khẩu" : "Please enter password";
		setLoginErrors(err);
		return !err.username && !err.password;
	};

	const validateForgotStep1 = () => {
		const err = { username: "", email: "" };
		if (!forgotUsername.trim())
			err.username =
				language === "vi"
					? "Vui lòng nhập tên người dùng"
					: "Please enter username";
		if (!forgotEmail)
			err.email =
				language === "vi" ? "Vui lòng nhập email" : "Please enter email";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail))
			err.email = language === "vi" ? "Email không hợp lệ" : "Invalid email";
		setForgotErrors({ ...forgotErrors, ...err });
		return !err.username && !err.email;
	};

	const validateForgotStep2 = () => {
		const err = { otp: "", newPassword: "", confirmNewPassword: "" };
		if (!otp.trim())
			err.otp = language === "vi" ? "Vui lòng nhập mã OTP" : "Please enter OTP";
		if (!newPassword)
			err.newPassword =
				language === "vi"
					? "Vui lòng nhập mật khẩu mới"
					: "Please enter new password";
		else if (newPassword.length < 8)
			err.newPassword =
				language === "vi"
					? "Mật khẩu phải ≥ 8 ký tự"
					: "Password must be ≥ 8 characters";
		else if (!/[a-z]/.test(newPassword))
			err.newPassword =
				language === "vi"
					? "Phải có 1 chữ thường"
					: "Must contain 1 lowercase letter";
		else if (!/\d/.test(newPassword))
			err.newPassword =
				language === "vi" ? "Phải có 1 số" : "Must contain 1 number";

		if (!confirmNewPassword)
			err.confirmNewPassword =
				language === "vi"
					? "Vui lòng xác nhận mật khẩu"
					: "Please confirm password";
		else if (newPassword !== confirmNewPassword)
			err.confirmNewPassword =
				language === "vi" ? "Mật khẩu không khớp" : "Passwords do not match";

		setForgotErrors({ ...forgotErrors, ...err });
		return !err.otp && !err.newPassword && !err.confirmNewPassword;
	};

	// === Xử lý ===
	const handleLogin = async () => {
		if (!validateLogin()) return;
		setIsLoading(true);
		await login(
			username.trim(),
			password,
			msg => {
				setIsLoading(false);
				onSuccess(msg);
				navigate("/", { replace: true });
			},
			() => {
				setLoginErrors({
					username: "",
					password:
						language === "vi"
							? "Tài khoản hoặc mật khẩu không đúng"
							: "Incorrect username or password",
				});
				setIsLoading(false);
			},
		);
	};

	const handleSendResetCode = async () => {
		if (!validateForgotStep1()) return;
		setIsLoading(true);
		await forgotPassword(
			forgotUsername,
			forgotEmail,
			msg => {
				setSuccess(msg);
				setForgotStep(2);
				setIsLoading(false);
			},
			err => {
				setForgotErrors({ ...forgotErrors, email: err });
				setIsLoading(false);
			},
		);
	};

	const handleConfirmReset = async () => {
		if (!validateForgotStep2()) return;
		setIsLoading(true);
		await confirmPasswordReset(
			forgotUsername,
			otp,
			newPassword,
			msg => {
				setSuccess(msg);
				setTimeout(() => {
					setIsForgotPassword(false);
					setForgotStep(1);
					setOtp("");
					setNewPassword("");
					setConfirmNewPassword("");
					setSuccess("");
				}, 2000);
				setIsLoading(false);
			},
			err => {
				setForgotErrors({ ...forgotErrors, otp: err });
				setIsLoading(false);
			},
		);
	};

	return (
		<div className='p-8'>
			{isForgotPassword ? (
				<div>
					<h2 className='text-2xl font-bold mb-6 text-text-primary font-primary text-center'>
						{language === "vi" ? "Quên Mật Khẩu" : "Forgot Password"}
					</h2>

					{forgotStep === 1 ? (
						<>
							<div className='mb-4'>
								<InputField
									label={language === "vi" ? "Tên người dùng" : "Username"}
									type='text'
									value={forgotUsername}
									onChange={e => setForgotUsername(e.target.value)}
									disabled={isLoading}
									error={forgotErrors.username}
									className='w-full'
									onKeyDown={e => e.key === "Enter" && handleSendResetCode()}
								/>
							</div>
							<div className='mb-6'>
								<InputField
									label='Email'
									type='email'
									value={forgotEmail}
									onChange={e => setForgotEmail(e.target.value)}
									disabled={isLoading}
									error={forgotErrors.email}
									className='w-full'
									onKeyDown={e => e.key === "Enter" && handleSendResetCode()}
								/>
							</div>
							<div className='flex flex-col sm:flex-row justify-between items-center mt-4 gap-4'>
								<Button
									onClick={handleSendResetCode}
									disabled={isLoading}
									className='w-full sm:w-auto'
									iconLeft={
										isLoading && <Loader2 className='animate-spin' size={16} />
									}
								>
									{isLoading
										? language === "vi"
											? "Đang gửi..."
											: "Sending..."
										: language === "vi"
											? "Gửi mã OTP"
											: "Send OTP"}
								</Button>
								<button
									type='button'
									onClick={() => setIsForgotPassword(false)}
									className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
								>
									{language === "vi" ? "Quay lại Đăng nhập" : "Back to Login"}
								</button>
							</div>
						</>
					) : (
						<>
							{success && (
								<p className='text-success mb-4 text-sm text-center'>
									{success}
								</p>
							)}
							<div className='mb-4'>
								<InputField
									label={language === "vi" ? "Mã OTP" : "OTP Code"}
									type='text'
									value={otp}
									onChange={e => setOtp(e.target.value)}
									placeholder={
										language === "vi"
											? "Nhập mã 6 chữ số"
											: "Enter 6-digit code"
									}
									disabled={isLoading}
									error={forgotErrors.otp}
									className='w-full'
									onKeyDown={e => e.key === "Enter" && handleConfirmReset()}
								/>
							</div>
							<div className='mb-4'>
								<InputField
									label={language === "vi" ? "Mật khẩu mới" : "New password"}
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={e => setNewPassword(e.target.value)}
									disabled={isLoading}
									error={forgotErrors.newPassword}
									className='w-full'
									rightIcon={
										<button
											type='button'
											onClick={() => setShowNewPassword(!showNewPassword)}
											className='text-text-secondary hover:text-text-primary'
											tabIndex={-1}
										>
											{showNewPassword ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
									}
									onKeyDown={e => e.key === "Enter" && handleConfirmReset()}
								/>
							</div>
							<div className='mb-4'>
								<InputField
									label={
										language === "vi" ? "Xác nhận mật khẩu" : "Confirm password"
									}
									type={showConfirmNewPassword ? "text" : "password"}
									value={confirmNewPassword}
									onChange={e => setConfirmNewPassword(e.target.value)}
									disabled={isLoading}
									error={forgotErrors.confirmNewPassword}
									className='w-full'
									rightIcon={
										<button
											type='button'
											onClick={() =>
												setShowConfirmNewPassword(!showConfirmNewPassword)
											}
											className='text-text-secondary hover:text-text-primary'
											tabIndex={-1}
										>
											{showConfirmNewPassword ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
									}
									onKeyDown={e => e.key === "Enter" && handleConfirmReset()}
								/>
							</div>
							<div className='text-xs text-text-secondary mb-6'>
								{language === "vi"
									? "Mật khẩu chỉ cần tối thiểu 8 ký tự, bao gồm chữ thường và số."
									: "Password must be at least 8 characters, including lowercase and numbers."}
							</div>
							<div className='flex flex-col sm:flex-row justify-between items-center mt-4 gap-4'>
								<Button
									onClick={handleConfirmReset}
									disabled={isLoading}
									className='w-full sm:w-auto'
									iconLeft={
										isLoading && <Loader2 className='animate-spin' size={16} />
									}
								>
									{isLoading
										? language === "vi"
											? "Đang xử lý..."
											: "Processing..."
										: language === "vi"
											? "Đặt lại mật khẩu"
											: "Reset Password"}
								</Button>
								<button
									type='button'
									onClick={() => setForgotStep(1)}
									className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
								>
									{language === "vi" ? "Gửi lại mã" : "Resend code"}
								</button>
							</div>
						</>
					)}
				</div>
			) : (
				<form
					onSubmit={e => {
						e.preventDefault();
						handleLogin();
					}}
					className='w-full'
				>
					<h2 className='text-2xl font-bold mb-6 text-text-primary font-primary text-center'>
						{language === "vi" ? "Đăng Nhập" : "Login"}
					</h2>

					<div className='mb-4'>
						<InputField
							label={language === "vi" ? "Tài khoản" : "Username"}
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder={
								language === "vi" ? "Nhập tài khoản" : "Enter username"
							}
							disabled={isLoading}
							error={loginErrors.username}
							className='w-full'
							onKeyDown={e => e.key === "Enter" && handleLogin()}
						/>
					</div>

					<div className='mb-6'>
						<InputField
							label={language === "vi" ? "Mật khẩu" : "Password"}
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder={
								language === "vi" ? "Nhập mật khẩu" : "Enter password"
							}
							disabled={isLoading}
							error={loginErrors.password}
							className='w-full'
							rightIcon={
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='text-text-secondary hover:text-text-primary'
									tabIndex={-1}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							}
							onKeyDown={e => e.key === "Enter" && handleLogin()}
						/>
						<button
							type='button'
							onClick={() => {
								setIsForgotPassword(true);
								setForgotStep(1);
							}}
							className='mt-2 block text-sm underline text-text-link hover:text-primary-700'
						>
							{language === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
						</button>
					</div>

					<div className='flex flex-col sm:flex-row justify-between items-center mt-4 gap-4'>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full sm:w-auto'
							iconLeft={
								isLoading && <Loader2 className='animate-spin' size={16} />
							}
						>
							{isLoading
								? language === "vi"
									? "Đang xử lý..."
									: "Processing..."
								: language === "vi"
									? "Đăng Nhập"
									: "Login"}
						</Button>
						<button
							type='button'
							onClick={onSwitchToRegister}
							className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
						>
							{language === "vi"
								? "Bạn chưa có tài khoản?"
								: "Don't have an account?"}
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default Login;
