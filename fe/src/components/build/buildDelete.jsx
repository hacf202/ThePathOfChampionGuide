// src/components/build/buildDelete.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../hooks/useTranslation.js"; // 🟢 Import i18n
import { Loader2 } from "lucide-react";
import Modal from "../common/modal";
import Button from "../common/button";

const BuildDelete = ({ build, isOpen, onClose, onConfirm }) => {
	const { token } = useAuth();
	const { language } = useTranslation(); // 🟢 Khởi tạo ngôn ngữ
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
				const result = await response.json();
				setMessage(
					language === "vi"
						? "Bộ cổ vật đã được xóa thành công!"
						: "Build deleted successfully!",
				);

				setTimeout(() => {
					onConfirm(build.id);
					handleClose();
				}, 1500);
			} else {
				const result = await response.json();
				setMessage(
					`Lỗi: ${result.error || (language === "vi" ? "Không thể xóa bộ cổ vật." : "Cannot delete build.")}`,
				);
				setIsDeleting(false);
			}
		} catch (error) {
			console.error("Lỗi khi xóa build:", error);
			setMessage(
				language === "vi"
					? "Lỗi kết nối đến máy chủ."
					: "Server connection error.",
			);
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
			title={language === "vi" ? "Xác nhận xóa bộ cổ vật" : "Confirm Deletion"}
		>
			<div className='p-1'>
				<p className='text-text-secondary mb-6'>
					{language === "vi"
						? "Bạn có chắc chắn muốn xóa bộ cổ vật cho tướng "
						: "Are you sure you want to delete the build for "}
					<strong className='font-semibold text-text-primary'>
						{build?.championName}
					</strong>
					?
					<br />
					<span className='text-danger-500 text-sm italic'>
						{language === "vi"
							? "Hành động này không thể hoàn tác."
							: "This action cannot be undone."}
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
						{language === "vi" ? "Hủy" : "Cancel"}
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? (
							<span className='flex items-center gap-2'>
								<Loader2 className='animate-spin w-4 h-4' />
								{language === "vi" ? "Đang xóa..." : "Deleting..."}
							</span>
						) : language === "vi" ? (
							"Xóa"
						) : (
							"Delete"
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BuildDelete;
