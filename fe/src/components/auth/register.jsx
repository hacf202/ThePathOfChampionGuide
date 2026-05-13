// src/pages/auth/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

import { mapAuthError } from "../../utils/authErrors";

const Register = ({ onClose, onSwitchToLogin }) => {
	const { tUI } = useTranslation();
	const { signUp } = useContext(AuthContext);

	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const [errors, setErrors] = useState({
		username: "",
		displayName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const validateForm = () => {
		const err = { username: "", displayName: "", email: "", password: "", confirmPassword: "" };

		if (!username.trim()) err.username = "Tên đăng nhập không được để trống";
		else if (/[^a-zA-Z0-9_]/.test(username))
			err.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";

		if (!displayName.trim()) err.displayName = "Tên hiển thị không được để trống";

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
		return !err.username && !err.displayName && !err.email && !err.password && !err.confirmPassword;
	};

	const handleRegister = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({ username: "", email: "", password: "", confirmPassword: "" });

		signUp(
			username.trim(),
			displayName.trim(),
			email.trim(),
			password,
			() => {
				setStep(2);
				setIsLoading(false);
			},
			async errMessage => {
				setErrors({ ...errors, username: mapAuthError(errMessage, tUI) });
				setIsLoading(false);
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
						placeholder="Tên đăng nhập (Dùng để đăng nhập)"
						value={username}
						onChange={e => setUsername(e.target.value)}
						disabled={isLoading}
						error={errors.username}
						className='w-full'
						autoComplete='username'
					/>

					<InputField
						type='text'
						placeholder="Tên hiển thị (Tên mọi người nhìn thấy)"
						value={displayName}
						onChange={e => setDisplayName(e.target.value)}
						disabled={isLoading}
						error={errors.displayName}
						className='w-full'
						autoComplete='name'
					/>

					<InputField
						type='email'
						placeholder={tUI("auth.emailLabel")}
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={isLoading}
						error={errors.email}
						className='w-full'
						autoComplete='email'
					/>

					<InputField
						type={showPassword ? "text" : "password"}
						placeholder={tUI("auth.passwordRegisterPlaceholder")}
						value={password}
						onChange={e => setPassword(e.target.value)}
						disabled={isLoading}
						error={errors.password}
						className='w-full'
						autoComplete='new-password'
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
						autoComplete='new-password'
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
				<div className="text-center py-8">
					<div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h3 className="text-xl font-bold text-text-primary mb-2">Đăng ký thành công!</h3>
					<p className="text-text-secondary mb-6">
						Tài khoản của bạn đã được tạo và sẵn sàng sử dụng. 
						Bạn có thể sử dụng Email <span className="font-semibold">{email}</span> để khôi phục mật khẩu nếu quên.
					</p>
					<Button onClick={onSwitchToLogin} className="w-full">
						Đăng nhập ngay
					</Button>
				</div>
			)}
		</div>
	);
};

export default Register;
