// src/pages/auth/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

const Login = ({ onSwitchToRegister, onSuccess }) => {
	const { tUI } = useTranslation();
	const { login, forgotPassword, confirmPasswordReset } =
		useContext(AuthContext);
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loginErrors, setLoginErrors] = useState({
		username: "",
		password: "",
	});

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

	const validateLogin = () => {
		const err = { username: "", password: "" };
		if (!username.trim()) err.username = tUI("auth.error.usernameReq");
		if (!password) err.password = tUI("auth.error.passwordReq");
		setLoginErrors(err);
		return !err.username && !err.password;
	};

	const validateForgotStep1 = () => {
		const err = { username: "", email: "" };
		if (!forgotUsername.trim()) err.username = tUI("auth.error.usernameReq");
		if (!forgotEmail) err.email = tUI("auth.error.emailReq");
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail))
			err.email = tUI("auth.error.emailInvalid");
		setForgotErrors({ ...forgotErrors, ...err });
		return !err.username && !err.email;
	};

	const validateForgotStep2 = () => {
		const err = { otp: "", newPassword: "", confirmNewPassword: "" };
		if (!otp.trim()) err.otp = tUI("auth.error.otpReq");
		if (!newPassword) err.newPassword = tUI("auth.error.newPassReq");
		else if (newPassword.length < 8)
			err.newPassword = tUI("auth.error.passMin");
		else if (!/[a-z]/.test(newPassword))
			err.newPassword = tUI("auth.error.passLower");
		else if (!/\d/.test(newPassword))
			err.newPassword = tUI("auth.error.passNum");

		if (!confirmNewPassword)
			err.confirmNewPassword = tUI("auth.error.passConfirmReq");
		else if (newPassword !== confirmNewPassword)
			err.confirmNewPassword = tUI("auth.error.passMismatch");

		setForgotErrors({ ...forgotErrors, ...err });
		return !err.otp && !err.newPassword && !err.confirmNewPassword;
	};

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
					password: tUI("auth.error.invalidCredentials"),
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
						{tUI("auth.forgotPasswordTitle")}
					</h2>

					{forgotStep === 1 ? (
						<>
							<div className='mb-4'>
								<InputField
									label={tUI("auth.usernameLabel")}
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
									label={tUI("auth.emailLabel")}
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
									{isLoading ? tUI("auth.sending") : tUI("auth.sendOtp")}
								</Button>
								<button
									type='button'
									onClick={() => setIsForgotPassword(false)}
									className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
								>
									{tUI("auth.backToLogin")}
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
									label={tUI("auth.otpLabel")}
									type='text'
									value={otp}
									onChange={e => setOtp(e.target.value)}
									placeholder={tUI("auth.otpPlaceholder")}
									disabled={isLoading}
									error={forgotErrors.otp}
									className='w-full'
									onKeyDown={e => e.key === "Enter" && handleConfirmReset()}
								/>
							</div>
							<div className='mb-4'>
								<InputField
									label={tUI("auth.newPassLabel")}
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
									label={tUI("auth.confirmNewPassLabel")}
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
								{tUI("auth.passHint")}
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
										? tUI("auth.processing")
										: tUI("auth.resetPassword")}
								</Button>
								<button
									type='button'
									onClick={() => setForgotStep(1)}
									className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
								>
									{tUI("auth.resendCode")}
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
						{tUI("auth.login")}
					</h2>

					<div className='mb-4'>
						<InputField
							label={tUI("auth.usernameLabel")}
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder={tUI("auth.usernamePlaceholder")}
							disabled={isLoading}
							error={loginErrors.username}
							className='w-full'
							onKeyDown={e => e.key === "Enter" && handleLogin()}
						/>
					</div>

					<div className='mb-6'>
						<InputField
							label={tUI("auth.passwordLabel")}
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder={tUI("auth.passwordPlaceholder")}
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
							{tUI("auth.forgotPassword")}
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
							{isLoading ? tUI("auth.processing") : tUI("auth.login")}
						</Button>
						<button
							type='button'
							onClick={onSwitchToRegister}
							className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
						>
							{tUI("auth.noAccount")}
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default Login;
