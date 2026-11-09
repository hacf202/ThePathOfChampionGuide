import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const STORAGE_KEY = "poc_system_maintenance_notice_until";
const SESSION_KEY = "poc_system_maintenance_notice_session";

const MaintenanceNoticeModal = () => {
	const { tUI } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowAgain, setDontShowAgain] = useState(true);

	useEffect(() => {
		try {
			const dismissedUntil = localStorage.getItem(STORAGE_KEY);
			const sessionDismissed = sessionStorage.getItem(SESSION_KEY);

			if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
				return;
			}
			if (sessionDismissed) {
				return;
			}

			const timer = setTimeout(() => {
				setIsOpen(true);
			}, 300);

			return () => clearTimeout(timer);
		} catch (e) {
			console.error("Notice error:", e);
		}
	}, []);

	useEffect(() => {
		const handleOpen = () => setIsOpen(true);
		window.addEventListener("open-system-notice", handleOpen);
		return () => window.removeEventListener("open-system-notice", handleOpen);
	}, []);

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

	const handleClose = () => {
		try {
			sessionStorage.setItem(SESSION_KEY, "true");
			if (dontShowAgain) {
				localStorage.setItem(STORAGE_KEY, (Date.now() + 24 * 60 * 60 * 1000).toString());
			}
		} catch (e) {
			console.error("Save notice state error:", e);
		}
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
			onClick={handleClose}
			aria-modal="true"
			role="dialog"
		>
			<div
				className="relative w-full max-w-md bg-surface-bg border border-border text-text-primary rounded-xl p-6 shadow-2xl animate-scale-up"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Nút đóng X */}
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary p-1 rounded-lg transition-colors"
					aria-label={tUI("common.close") || "Đóng"}
				>
					<X className="w-5 h-5" />
				</button>

				{/* Icon & Tiêu đề */}
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
						<AlertCircle className="w-6 h-6" />
					</div>
					<h3 className="text-lg font-bold font-primary text-text-primary">
						{tUI("systemNotice.title") || "Thông Báo Bảo Trì & Đổi Tên Miền"}
					</h3>
				</div>

				{/* Nội dung thông báo ngắn gọn */}
				<p className="text-sm text-text-secondary leading-relaxed mb-5">
					{tUI("systemNotice.message") ||
						"Trang web sẽ tiến hành nâng cấp hệ thống và chuyển sang tên miền mới trong thời gian tới."}
				</p>

				{/* Hành động dưới cùng */}
				<div className="flex items-center justify-between pt-3 border-t border-border">
					<label className="flex items-center gap-2 cursor-pointer select-none text-xs text-text-tertiary hover:text-text-secondary transition-colors">
						<input
							type="checkbox"
							checked={dontShowAgain}
							onChange={(e) => setDontShowAgain(e.target.checked)}
							className="w-4 h-4 rounded border-border text-amber-500 focus:ring-0 cursor-pointer"
						/>
						<span>{tUI("systemNotice.dontShowAgain") || "Không hiện lại hôm nay"}</span>
					</label>

					<button
						onClick={handleClose}
						className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
					>
						{tUI("systemNotice.acknowledge") || "Đã hiểu"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MaintenanceNoticeModal;
