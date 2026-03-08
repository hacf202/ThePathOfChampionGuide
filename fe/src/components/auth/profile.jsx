// src/pages/auth/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Pencil, Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import InputField from "../common/inputField";
import Button from "../common/button";
import PageTitle from "../common/pageTitle";
import { useTranslation } from "../../hooks/useTranslation";

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
	const { tUI } = useTranslation();
	const { user, changeName, changePassword } = useAuth();
	const navigate = useNavigate();

	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState("");
	const [isNameLoading, setIsNameLoading] = useState(false);

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
			setErrorMessage(tUI("profile.error.nameReq"));
			return;
		}
		if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
			setErrorMessage(tUI("profile.error.nameInvalid"));
			return;
		}

		setIsNameLoading(true);
		try {
			await changeName(name);
			setIsEditingName(false);
			setMessage(tUI("profile.success.nameUpdated"));
		} catch (error) {
			setErrorMessage(tUI("profile.error.nameUpdateFailed"));
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

		if (!oldPassword) newErrors.oldPassword = tUI("profile.error.oldPassReq");
		if (!newPassword) newErrors.newPassword = tUI("auth.error.newPassReq");
		else if (newPassword.length < 8 || !/\d/.test(newPassword))
			newErrors.newPassword = tUI("auth.error.passFormatFull");

		if (!confirmPassword)
			newErrors.confirmPassword = tUI("auth.error.passConfirmReq");
		else if (newPassword !== confirmPassword)
			newErrors.confirmPassword = tUI("auth.error.passMismatch");

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsPasswordLoading(true);
		try {
			await changePassword(oldPassword, newPassword, confirmPassword);
			setMessage(tUI("profile.success.passUpdated"));
			setIsChangingPassword(false);
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			setErrorMessage(err || tUI("profile.error.passUpdateFailed"));
		} finally {
			setIsPasswordLoading(false);
		}
	};

	if (!user) return null;

	return (
		<div className='min-h-screen bg-bg-primary pt-24 px-4 font-secondary animate-fadeIn'>
			<PageTitle title={tUI("profile.title")} />
			<div className='max-w-3xl mx-auto'>
				<div className='flex items-center justify-between mb-8'>
					<h1 className='text-3xl font-bold text-text-primary font-primary uppercase tracking-wider'>
						{tUI("profile.title")}
					</h1>
					<Button variant='outline' onClick={() => navigate(-1)}>
						<ChevronLeft size={18} />
						<span className='hidden sm:inline'>{tUI("common.back")}</span>
					</Button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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

					<div className='md:col-span-2 space-y-6'>
						<div className='bg-surface-bg rounded-2xl p-6 sm:p-8 border border-border shadow-lg relative overflow-hidden'>
							<div className='absolute top-0 left-0 w-1 h-full bg-primary-500'></div>
							<h3 className='text-xl font-bold text-text-primary mb-6 font-primary flex items-center gap-2'>
								{tUI("profile.accountInfo")}
							</h3>

							<div className='space-y-6'>
								<div>
									<label className='block text-sm font-medium text-text-secondary mb-2'>
										{tUI("profile.displayName")}
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
													) : (
														tUI("common.save")
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
													{tUI("common.cancel")}
												</Button>
											</div>
										</div>
									) : (
										<div className='flex justify-between items-center bg-surface-hover p-3 rounded-lg border border-border'>
											<span className='text-text-primary font-medium'>
												{user.name || tUI("profile.noName")}
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

						<div className='bg-surface-bg rounded-2xl p-6 sm:p-8 border border-border shadow-lg relative overflow-hidden'>
							<div className='absolute top-0 left-0 w-1 h-full bg-purple-500'></div>
							<div className='flex justify-between items-center mb-6'>
								<h3 className='text-xl font-bold text-text-primary font-primary'>
									{tUI("profile.updatePasswordTitle")}
								</h3>
								{!isChangingPassword && (
									<Button
										variant='outline'
										onClick={() => setIsChangingPassword(true)}
									>
										<Pencil size={16} className='mr-2' /> {tUI("common.edit")}
									</Button>
								)}
							</div>

							{isChangingPassword && (
								<form onSubmit={handleUpdatePassword} className='space-y-4'>
									<InputField
										label={tUI("profile.currentPassword")}
										type={showOldPassword ? "text" : "password"}
										placeholder={tUI("profile.currentPassword")}
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
										label={tUI("auth.newPassLabel")}
										type={showNewPassword ? "text" : "password"}
										placeholder={tUI("auth.newPassPlaceholder")}
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
										label={tUI("auth.confirmNewPassLabel")}
										type={showConfirmPassword ? "text" : "password"}
										placeholder={tUI("auth.confirmNewPassLabel")}
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
										{tUI("auth.passHint")}
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
												? tUI("profile.updating")
												: tUI("profile.confirmChange")}
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
											{tUI("common.cancel")}
										</Button>
									</div>
								</form>
							)}

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
