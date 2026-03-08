// src/pages/auth/Register.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import OTPConfirmation from "./OTPConfirmation";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const Register = ({ onClose, onSwitchToLogin }) => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
	const { signUp, resendConfirmationCode } = useContext(AuthContext);

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	// Lỗi chỉ hiện khi submit
	const [errors, setErrors] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// === Validate (chỉ gọi khi submit) ===
	const validateForm = () => {
		const err = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		};

		if (!username.trim())
			err.username =
				language === "vi"
					? "Vui lòng nhập tên người dùng"
					: "Please enter username";
		else if (/[^a-zA-Z0-9_]/.test(username))
			err.username =
				language === "vi"
					? "Chỉ cho phép chữ, số và gạch dưới"
					: "Only letters, numbers, and underscores allowed";

		if (!email)
			err.email =
				language === "vi" ? "Vui lòng nhập email" : "Please enter email";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			err.email = language === "vi" ? "Email không hợp lệ" : "Invalid email";

		if (!password)
			err.password =
				language === "vi" ? "Vui lòng nhập mật khẩu" : "Please enter password";
		else if (password.length < 8)
			err.password =
				language === "vi"
					? "Mật khẩu phải ≥ 8 ký tự"
					: "Password must be ≥ 8 characters";
		else if (!/\d/.test(password))
			err.password =
				language === "vi" ? "Phải có 1 số" : "Must contain 1 number";

		if (!confirmPassword)
			err.confirmPassword =
				language === "vi"
					? "Vui lòng xác nhận mật khẩu"
					: "Please confirm password";
		else if (password !== confirmPassword)
			err.confirmPassword =
				language === "vi" ? "Mật khẩu không khớp" : "Passwords do not match";

		setErrors(err);
		return !err.username && !err.email && !err.password && !err.confirmPassword;
	};

	// === Xử lý đăng ký ===
	const handleRegister = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({ username: "", email: "", password: "", confirmPassword: "" });

		signUp(
			username.trim(),
			email.trim(),
			password,
			// === Case 1: Đăng ký thành công (Tài khoản mới) ===
			() => {
				setStep(2);
				setIsLoading(false);
			},
			// === Case 2: Đăng ký thất bại ===
			async errMessage => {
				// Kiểm tra xem lỗi có phải do tài khoản đã tồn tại không
				const isExistError =
					errMessage.includes("exists") ||
					errMessage.includes("UsernameExistsException");

				if (isExistError) {
					await resendConfirmationCode(
						username.trim(),
						// Resend thành công:
						msg => {
							alert(
								language === "vi"
									? "Tài khoản đã tồn tại nhưng chưa kích hoạt. Mã OTP mới đã được gửi vào email."
									: "Account exists but is unconfirmed. A new OTP has been sent to your email.",
							);
							setStep(2);
							setIsLoading(false);
						},
						// Resend thất bại:
						err => {
							setErrors({
								...errors,
								username:
									language === "vi"
										? "Tài khoản hoặc email đã tồn tại."
										: "Username or email already exists.",
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
						{language === "vi"
							? "Đăng Ký Tài Khoản Mới"
							: "Register New Account"}
					</h2>

					<InputField
						type='text'
						placeholder={language === "vi" ? "Tên người dùng" : "Username"}
						value={username}
						onChange={e => setUsername(e.target.value)}
						disabled={isLoading}
						error={errors.username}
						className='w-full'
					/>

					<InputField
						type='email'
						placeholder={language === "vi" ? "Email" : "Email"}
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={isLoading}
						error={errors.email}
						className='w-full'
					/>

					<InputField
						type={showPassword ? "text" : "password"}
						placeholder={
							language === "vi"
								? "Mật khẩu (≥8 ký tự)"
								: "Password (≥8 characters)"
						}
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
						placeholder={
							language === "vi" ? "Xác nhận mật khẩu" : "Confirm password"
						}
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

					<p className='text-xs text-text-secondary'>
						{language === "vi"
							? "Mật khẩu chỉ cần tối thiểu 8 ký tự, bao gồm chữ thường và số."
							: "Password must be at least 8 characters, including lowercase and numbers."}
					</p>

					<div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
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
									? "Đăng Ký"
									: "Register"}
						</Button>
						<button
							type='button'
							onClick={onSwitchToLogin}
							className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
						>
							{language === "vi" ? "Quay lại Đăng nhập" : "Back to Login"}
						</button>
					</div>
				</form>
			) : (
				<OTPConfirmation
					username={username}
					onSuccess={() => {
						setTimeout(() => onClose(), 2000);
					}}
					onClose={onClose}
				/>
			)}
		</div>
	);
};

export default Register;
