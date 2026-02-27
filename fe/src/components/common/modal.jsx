// src/components/common/Modal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
	// Khóa cuộn trang khi Modal đang mở
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const modalContent = (
		// Tăng z-index lên cao (z-[100]) để đè lên Navbar
		<div
			className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity duration-300'
			onClick={onClose}
			aria-modal='true'
			role='dialog'
		>
			<div
				className={`bg-surface-bg text-text-primary rounded-lg shadow-xl w-full ${maxWidth} 
                relative border border-border max-h-[95vh] flex flex-col
                animate-scale-up`}
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div className='flex justify-between items-center p-4 border-b border-border flex-shrink-0'>
					<h3 className='text-xl font-bold text-primary-500 font-primary'>
						{title}
					</h3>
					<button
						onClick={onClose}
						className='text-text-secondary hover:text-text-primary transition-colors 
                        rounded-full p-1 focus:outline-none focus:ring-2 
                        focus:ring-offset-surface-bg focus:ring-primary-500'
						aria-label='Close modal'
					>
						<X size={24} />
					</button>
				</div>

				{/* Body (có thể cuộn) */}
				<div className='p-2 md:p-6 overflow-y-auto custom-scrollbar'>
					{children}
				</div>
			</div>
		</div>
	);

	// Gắn Modal vào document.body thay vì render tại chỗ
	return createPortal(modalContent, document.body);
};

export default Modal;
