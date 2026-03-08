// src/pages/auth/Profile.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Pencil, Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import InputField from "../common/inputField";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const maskEmail = email => {
	if (!email || !email.includes("@")) return email;
	const [localPart, domain] = email.split("@");
	const domainParts = domain.split(".");
	const tld = domainParts.pop();
	const domainName = domainParts.join(".");
	const maskedLocal =
		localPart.length > 2
			? localPart.substring(0, 2) + "*".repeat(localPart.length - 2)
			: localPart.substring(0, 1) + "*";
	const maskedDomainName =
		domainName.length > 1
			? domainName.substring(0, 1) + "*".repeat(domainName.length - 1)
			: domainName;
	return `${maskedLocal}@${maskedDomainName}.${tld}`;
};

const Profile = () => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
	const { user, changeName, changePassword } = useAuth();
	const navigate = useNavigate();

	// === Tên hiển thị ===
	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState("");
	const [isNameLoading, setIsNameLoading] = useState(false);

	// === Đổi mật khẩu ===
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [errors, setErrors] = useState({});
	const [message, setMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (user) {
			setName(user.name || user.preferred_username || "");
		}
	}, [user]);

	const handleUpdateName = async () => {
		setErrorMessage("");
		setMessage("");
		if (!name.trim()) {
			setErrorMessage(
				language === "vi" ? "Vui lòng nhập tên" : "Please enter a name",
			);
			return;
		}
		if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
			setErrorMessage(
				language === "vi"
					? "Tên chỉ được chứa chữ, số và khoảng trắng"
					: "Name can only contain letters, numbers, and spaces",
			);
			return;
		}

		setIsNameLoading(true);
		try {
			await changeName(name);
			setIsEditingName(false);
			setMessage(
				language === "vi"
					? "Cập nhật tên thành công"
					: "Name updated successfully",
			);
		} catch (error) {
			setErrorMessage(
				language === "vi" ? "Lỗi cập nhật tên" : "Failed to update name",
			);
		} finally {
			setIsNameLoading(false);
		}
	};

	const handleUpdatePassword = async e => {
		e.preventDefault();
		setErrorMessage("");
		setMessage("");
		setErrors({});

		let newErrors = {};

		if (!oldPassword)
			newErrors.oldPassword =
				language === "vi"
					? "Vui lòng nhập mật khẩu hiện tại"
					: "Please enter current password";
		if (!newPassword)
			newErrors.newPassword =
				language === "vi"
					? "Vui lòng nhập mật khẩu mới"
					: "Please enter new password";
		else if (newPassword.length < 8 || !/\d/.test(newPassword))
			newErrors.newPassword =
				language === "vi"
					? "Mật khẩu mới phải ≥ 8 ký tự, có chữ và số"
					: "New password must be ≥ 8 characters, including letters and numbers";

		if (!confirmPassword)
			newErrors.confirmPassword =
				language === "vi"
					? "Vui lòng xác nhận mật khẩu mới"
					: "Please confirm new password";
		else if (newPassword !== confirmPassword)
			newErrors.confirmPassword =
				language === "vi"
					? "Mật khẩu mới không khớp"
					: "New passwords do not match";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsPasswordLoading(true);
		try {
			await changePassword(oldPassword, newPassword, confirmPassword);
			setMessage(
				language === "vi"
					? "Đổi mật khẩu thành công!"
					: "Password changed successfully!",
			);
			setIsChangingPassword(false);
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			setErrorMessage(
				err ||
					(language === "vi"
						? "Lỗi đổi mật khẩu"
						: "Failed to change password"),
			);
		} finally {
			setIsPasswordLoading(false);
		}
	};

	if (!user) return null;

	return (
		<div className='min-h-screen bg-bg-primary pt-24 px-4 font-secondary animate-fadeIn'>
			<PageTitle title={language === "vi" ? "Hồ Sơ Của Tôi" : "My Profile"} />
			<div className='max-w-3xl mx-auto'>
				<div className='flex items-center justify-between mb-8'>
					<h1 className='text-3xl font-bold text-text-primary font-primary uppercase tracking-wider'>
						{language === "vi" ? "Hồ Sơ Của Tôi" : "My Profile"}
					</h1>
					<Button variant='outline' onClick={() => navigate(-1)}>
						<ChevronLeft size={18} />
						<span className='hidden sm:inline'>
							{language === "vi" ? "Quay lại" : "Back"}
						</span>
					</Button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{/* Cột trái: Avatar cơ bản */}
					<div className='md:col-span-1'>
						<div className='bg-surface-bg rounded-2xl p-6 border border-border flex flex-col items-center justify-center shadow-lg'>
							<div className='w-32 h-32 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-inner'>
								{user.name?.charAt(0)?.toUpperCase() || "U"}
							</div>
							<h2 className='text-xl font-bold text-text-primary mb-1 text-center truncate w-full'>
								{user.name}
							</h2>
							<p className='text-sm text-text-secondary mb-4 bg-surface-hover px-3 py-1 rounded-full border border-border'>
								{user.isAdmin ? "Admin" : "Member"}
							</p>
						</div>
					</div>

					{/* Cột phải: Thông tin chi tiết */}
					<div className='md:col-span-2 space-y-6'>
						{/* 1. Thông tin chung */}
						<div className='bg-surface-bg rounded-2xl p-6 sm:p-8 border border-border shadow-lg relative overflow-hidden'>
							<div className='absolute top-0 left-0 w-1 h-full bg-primary-500'></div>
							<h3 className='text-xl font-bold text-text-primary mb-6 font-primary flex items-center gap-2'>
								{language === "vi"
									? "Thông tin tài khoản"
									: "Account Information"}
							</h3>

							<div className='space-y-6'>
								{/* Name Field */}
								<div>
									<label className='block text-sm font-medium text-text-secondary mb-2'>
										{language === "vi" ? "Tên hiển thị:" : "Display Name:"}
									</label>
									{isEditingName ? (
										<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
											<InputField
												type='text'
												value={name}
												onChange={e => setName(e.target.value)}
												className='flex-grow w-full'
												disabled={isNameLoading}
											/>
											<div className='flex gap-2 w-full sm:w-auto'>
												<Button
													onClick={handleUpdateName}
													disabled={isNameLoading}
													variant='primary'
													className='flex-1 sm:flex-none'
												>
													{isNameLoading ? (
														<Loader2 className='animate-spin' size={18} />
													) : language === "vi" ? (
														"Lưu"
													) : (
														"Save"
													)}
												</Button>
												<Button
													onClick={() => {
														setIsEditingName(false);
														setName(user.name);
													}}
													variant='outline'
													disabled={isNameLoading}
													className='flex-1 sm:flex-none'
												>
													{language === "vi" ? "Hủy" : "Cancel"}
												</Button>
											</div>
										</div>
									) : (
										<div className='flex justify-between items-center bg-surface-hover p-3 rounded-lg border border-border'>
											<span className='text-text-primary font-medium'>
												{user.name ||
													(language === "vi" ? "Chưa có tên" : "No name set")}
											</span>
											<button
												onClick={() => setIsEditingName(true)}
												className='text-text-secondary hover:text-primary-500 transition-colors p-2 rounded-md hover:bg-surface-bg'
											>
												<Pencil size={16} />
											</button>
										</div>
									)}
								</div>

								{/* Email Field (Read Only) */}
								<div>
									<label className='block text-sm font-medium text-text-secondary mb-2'>
										Email:
									</label>
									<div className='bg-surface-hover p-3 rounded-lg border border-border text-text-secondary cursor-not-allowed'>
										{maskEmail(user.email)}
									</div>
								</div>
							</div>
						</div>

						{/* 2. Đổi mật khẩu */}
						<div className='bg-surface-bg rounded-2xl p-6 sm:p-8 border border-border shadow-lg relative overflow-hidden'>
							<div className='absolute top-0 left-0 w-1 h-full bg-purple-500'></div>
							<div className='flex justify-between items-center mb-6'>
								<h3 className='text-xl font-bold text-text-primary font-primary'>
									{language === "vi" ? "Cập nhật mật khẩu" : "Update Password"}
								</h3>
								{!isChangingPassword && (
									<Button
										variant='outline'
										onClick={() => setIsChangingPassword(true)}
									>
										<Pencil size={16} className='mr-2' />{" "}
										{language === "vi" ? "Sửa" : "Edit"}
									</Button>
								)}
							</div>

							{isChangingPassword && (
								<form onSubmit={handleUpdatePassword} className='space-y-4'>
									<InputField
										label={
											language === "vi"
												? "Mật khẩu hiện tại"
												: "Current password"
										}
										type={showOldPassword ? "text" : "password"}
										placeholder={
											language === "vi"
												? "Nhập mật khẩu hiện tại"
												: "Enter current password"
										}
										value={oldPassword}
										onChange={e => setOldPassword(e.target.value)}
										error={errors.oldPassword}
										rightIcon={
											<button
												type='button'
												onClick={() => setShowOldPassword(!showOldPassword)}
												className='text-text-secondary hover:text-text-primary'
												tabIndex={-1}
											>
												{showOldPassword ? (
													<EyeOff size={18} />
												) : (
													<Eye size={18} />
												)}
											</button>
										}
									/>

									<InputField
										label={language === "vi" ? "Mật khẩu mới" : "New password"}
										type={showNewPassword ? "text" : "password"}
										placeholder={
											language === "vi"
												? "Nhập mật khẩu mới"
												: "Enter new password"
										}
										value={newPassword}
										onChange={e => setNewPassword(e.target.value)}
										error={errors.newPassword}
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
									/>

									<InputField
										label={
											language === "vi"
												? "Xác nhận mật khẩu mới"
												: "Confirm new password"
										}
										type={showConfirmPassword ? "text" : "password"}
										placeholder={
											language === "vi"
												? "Nhập lại mật khẩu mới"
												: "Re-enter new password"
										}
										value={confirmPassword}
										onChange={e => setConfirmPassword(e.target.value)}
										error={errors.confirmPassword}
										rightIcon={
											<button
												type='button'
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className='text-text-secondary hover:text-text-primary'
												tabIndex={-1}
											>
												{showConfirmPassword ? (
													<EyeOff size={18} />
												) : (
													<Eye size={18} />
												)}
											</button>
										}
									/>

									<div className='text-xs text-text-secondary'>
										{language === "vi"
											? "Mật khẩu chỉ cần tối thiểu 8 ký tự, bao gồm chữ thường và số."
											: "Password must be at least 8 characters, including lowercase and numbers."}
									</div>

									<div className='flex gap-3 pt-2'>
										<Button
											type='submit'
											variant='primary'
											disabled={isPasswordLoading}
											className='flex-1'
											iconLeft={
												isPasswordLoading && (
													<Loader2 className='animate-spin' size={16} />
												)
											}
										>
											{isPasswordLoading
												? language === "vi"
													? "Đang cập nhật..."
													: "Updating..."
												: language === "vi"
													? "Xác nhận đổi mật khẩu"
													: "Confirm password change"}
										</Button>
										<Button
											type='button'
											variant='outline'
											onClick={() => {
												setIsChangingPassword(false);
												setErrors({});
												setOldPassword("");
												setNewPassword("");
												setConfirmPassword("");
											}}
											disabled={isPasswordLoading}
										>
											{language === "vi" ? "Hủy" : "Cancel"}
										</Button>
									</div>
								</form>
							)}

							{/* Thông báo */}
							<div className='mt-4'>
								{message && (
									<p className='text-sm text-success text-center bg-success/10 py-2 rounded-md border border-success/20'>
										{message}
									</p>
								)}
								{errorMessage && (
									<p className='text-sm text-danger-text-dark text-center bg-danger-500/10 py-2 rounded-md border border-danger-500/20'>
										{errorMessage}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
