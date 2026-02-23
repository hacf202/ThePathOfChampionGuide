// src/components/build/buildDelete.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";
import Modal from "../common/modal";
import Button from "../common/button";

const BuildDelete = ({ build, isOpen, onClose, onConfirm }) => {
	const { token } = useAuth();
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
					Authorization: `Bearer ${token}`, // Yêu cầu xác thực Admin hoặc Owner
				},
			});

			if (response.ok) {
				const result = await response.json();
				setMessage(result.message || "Bộ cổ vật đã được xóa thành công!");

				// Đợi 1.5s để người dùng thấy thông báo thành công trước khi đóng
				setTimeout(() => {
					onConfirm(build.id);
					handleClose();
				}, 1500);
			} else {
				const result = await response.json();
				setMessage(`Lỗi: ${result.error || "Không thể xóa bộ cổ vật."}`);
				setIsDeleting(false);
			}
		} catch (error) {
			console.error("Lỗi khi xóa build:", error);
			setMessage("Lỗi kết nối đến máy chủ.");
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		if (isDeleting) return; // Không cho phép đóng khi đang thực hiện xóa
		setMessage("");
		setIsDeleting(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title='Xác nhận xóa bộ cổ vật'>
			<div className='p-1'>
				<p className='text-text-secondary mb-6'>
					Bạn có chắc chắn muốn xóa bộ cổ vật cho tướng{" "}
					<strong className='font-semibold text-text-primary'>
						{build?.championName}
					</strong>
					?
					<br />
					<span className='text-danger-500 text-sm italic'>
						Hành động này không thể hoàn tác.
					</span>
				</p>

				{message && (
					<p
						className={`mb-4 text-center text-sm font-medium ${
							message.startsWith("Lỗi")
								? "text-danger-text-dark"
								: "text-success"
						}`}
					>
						{message}
					</p>
				)}

				<div className='flex justify-end gap-4 border-t border-border pt-4'>
					<Button variant='ghost' onClick={handleClose} disabled={isDeleting}>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? (
							<span className='flex items-center gap-2'>
								<Loader2 className='animate-spin' size={18} />
								Đang xóa...
							</span>
						) : (
							"Xóa vĩnh viễn"
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BuildDelete;
