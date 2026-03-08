// src/pages/auth/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import OTPConfirmation from "./OTPConfirmation";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const Register = ({ onClose, onSwitchToLogin }) => {
	const { tUI } = useTranslation();
	const { signUp, resendConfirmationCode } = useContext(AuthContext);

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const [errors, setErrors] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const validateForm = () => {
		const err = { username: "", email: "", password: "", confirmPassword: "" };

		if (!username.trim()) err.username = tUI("auth.error.usernameReq");
		else if (/[^a-zA-Z0-9_]/.test(username))
			err.username = tUI("auth.error.usernameFormat");

		if (!email) err.email = tUI("auth.error.emailReq");
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			err.email = tUI("auth.error.emailInvalid");

		if (!password) err.password = tUI("auth.error.passwordReq");
		else if (password.length < 8) err.password = tUI("auth.error.passMin");
		else if (!/\d/.test(password)) err.password = tUI("auth.error.passNum");

		if (!confirmPassword)
			err.confirmPassword = tUI("auth.error.passConfirmReq");
		else if (password !== confirmPassword)
			err.confirmPassword = tUI("auth.error.passMismatch");

		setErrors(err);
		return !err.username && !err.email && !err.password && !err.confirmPassword;
	};

	const handleRegister = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({ username: "", email: "", password: "", confirmPassword: "" });

		signUp(
			username.trim(),
			email.trim(),
			password,
			() => {
				setStep(2);
				setIsLoading(false);
			},
			async errMessage => {
				const isExistError =
					errMessage.includes("exists") ||
					errMessage.includes("UsernameExistsException");

				if (isExistError) {
					await resendConfirmationCode(
						username.trim(),
						msg => {
							alert(tUI("auth.error.accountExistsUnconfirmed"));
							setStep(2);
							setIsLoading(false);
						},
						err => {
							setErrors({
								...errors,
								username: tUI("auth.error.accountExists"),
							});
							setIsLoading(false);
						},
					);
				} else {
					setErrors({ ...errors, username: errMessage });
					setIsLoading(false);
				}
			},
		);
	};

	return (
		<div className='p-8'>
			{step === 1 ? (
				<form onSubmit={handleRegister} className='space-y-4'>
					<h2 className='text-2xl font-bold mb-6 text-text-primary font-primary text-center'>
						{tUI("auth.registerTitle")}
					</h2>

					<InputField
						type='text'
						placeholder={tUI("auth.usernameLabel")}
						value={username}
						onChange={e => setUsername(e.target.value)}
						disabled={isLoading}
						error={errors.username}
						className='w-full'
					/>

					<InputField
						type='email'
						placeholder={tUI("auth.emailLabel")}
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={isLoading}
						error={errors.email}
						className='w-full'
					/>

					<InputField
						type={showPassword ? "text" : "password"}
						placeholder={tUI("auth.passwordRegisterPlaceholder")}
						value={password}
						onChange={e => setPassword(e.target.value)}
						disabled={isLoading}
						error={errors.password}
						className='w-full'
						rightIcon={
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='p-1'
								tabIndex={-1}
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						}
					/>

					<InputField
						type={showConfirmPassword ? "text" : "password"}
						placeholder={tUI("auth.confirmNewPassLabel")}
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						disabled={isLoading}
						error={errors.confirmPassword}
						className='w-full'
						rightIcon={
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='p-1'
								tabIndex={-1}
							>
								{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						}
					/>

					<p className='text-xs text-text-secondary'>{tUI("auth.passHint")}</p>

					<div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full sm:w-auto'
							iconLeft={
								isLoading && <Loader2 className='animate-spin' size={16} />
							}
						>
							{isLoading ? tUI("auth.processing") : tUI("auth.register")}
						</Button>
						<button
							type='button'
							onClick={onSwitchToLogin}
							className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
						>
							{tUI("auth.backToLogin")}
						</button>
					</div>
				</form>
			) : (
				<OTPConfirmation
					username={username}
					onSuccess={() => setTimeout(() => onClose(), 2000)}
					onClose={onClose}
				/>
			)}
		</div>
	);
};

export default Register;
