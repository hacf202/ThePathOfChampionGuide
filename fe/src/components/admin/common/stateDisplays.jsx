import { memo } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

export const LoadingState = memo(({ text }) => {
	const { tUI } = useTranslation();

	return (
		<div className='flex flex-col items-center justify-center min-h-[400px] text-text-secondary w-full'>
			<Loader2 className='animate-spin text-primary-500' size={48} />
			<div className='text-lg mt-4'>
				{text || tUI("common.loading") || "Đang tải dữ liệu..."}
			</div>
		</div>
	);
});

export const ErrorState = memo(({ message }) => {
	const { tUI } = useTranslation();

	return (
		<div className='flex items-center justify-center min-h-[400px] w-full'>
			<div className='text-center p-10 bg-red-500/10 border border-red-500 rounded-xl text-red-500 max-w-lg'>
				<h3 className='font-bold text-lg mb-2'>
					{tUI("admin.common.errorOccurred") || "Đã xảy ra lỗi"}
				</h3>
				<p>{message}</p>
			</div>
		</div>
	);
});
