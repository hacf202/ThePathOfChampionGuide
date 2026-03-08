// src/components/build/buildDelete.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../hooks/useTranslation.js"; // 🟢 Import i18n
import { Loader2 } from "lucide-react";
import Modal from "../common/modal";
import Button from "../common/button";

const BuildDelete = ({ build, isOpen, onClose, onConfirm }) => {
	const { token } = useAuth();
	const { tUI } = useTranslation(); // 🟢 Sử dụng tUI
	const [isDeleting, setIsDeleting] = useState(false);
	const [message, setMessage] = useState("");

	const handleDelete = async () => {
		if (!build || !build.id) return;

		setIsDeleting(true);
		setMessage("");

		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${apiUrl}/api/builds/${build.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				setMessage(tUI("buildDelete.successMessage"));

				setTimeout(() => {
					onConfirm(build.id);
					handleClose();
				}, 1500);
			} else {
				const result = await response.json();
				setMessage(`Lỗi: ${result.error || tUI("buildDelete.errorMessage")}`);
				setIsDeleting(false);
			}
		} catch (error) {
			console.error("Lỗi khi xóa build:", error);
			setMessage(tUI("common.errorLoadData"));
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		if (isDeleting) return;
		setMessage("");
		setIsDeleting(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={tUI("buildDelete.title")}
		>
			<div className='p-1'>
				<p className='text-text-secondary mb-6'>
					{tUI("buildDelete.confirmPrompt")}{" "}
					<strong className='font-semibold text-text-primary'>
						{build?.championName}
					</strong>
					?
					<br />
					<span className='text-danger-500 text-sm italic'>
						{tUI("buildDelete.warning")}
					</span>
				</p>

				{message && (
					<p
						className={`mb-4 text-center text-sm font-medium ${
							message.startsWith("Lỗi") || message.startsWith("Error")
								? "text-danger-text-dark"
								: "text-success"
						}`}
					>
						{message}
					</p>
				)}

				<div className='flex justify-end gap-4 border-t border-border pt-4'>
					<Button variant='ghost' onClick={handleClose} disabled={isDeleting}>
						{tUI("common.cancel")}
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? (
							<span className='flex items-center gap-2'>
								<Loader2 className='animate-spin w-4 h-4' />
								{tUI("buildDelete.deleting")}
							</span>
						) : (
							tUI("common.delete")
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BuildDelete;
