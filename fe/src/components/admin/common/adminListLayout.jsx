import React from "react";
import Button from "../../common/button";
import SidePanel from "../../common/sidePanel";
import { useTranslation } from "../../../hooks/useTranslation";

const AdminListLayout = ({
	dataLength,
	totalPages,
	currentPage,
	onPageChange,
	sidePanelProps,
	emptyMessageTitle,
	emptyMessageSub,
	children, // Là nội dung Grid các Card truyền vào
}) => {
	const { tUI } = useTranslation();

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
				{dataLength > 0 ? (
					children
				) : (
					<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
						<div>
							<p className='font-semibold text-lg'>
								{emptyMessageTitle || tUI("common.notFound")}
							</p>
							<p>{emptyMessageSub || "Vui lòng thử bộ lọc khác"}</p>
						</div>
					</div>
				)}

				{totalPages > 1 && (
					<div className='mt-8 flex justify-center items-center gap-2 md:gap-4'>
						<Button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							variant='outline'
						>
							{tUI("admin.common.prevPage") || "Trang trước"}
						</Button>
						<span className='text-lg font-medium text-text-primary'>
							{currentPage} / {totalPages}
						</span>
						<Button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							variant='outline'
						>
							{tUI("admin.common.nextPage") || "Trang sau"}
						</Button>
					</div>
				)}
			</div>
			<div className='lg:w-1/5 shrink-0'>
				<SidePanel {...sidePanelProps} />
			</div>
		</div>
	);
};

export default AdminListLayout;
