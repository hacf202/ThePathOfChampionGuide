import React, { useState } from "react";
import Button from "../../common/button";
import SidePanel from "../../common/sidePanel";
import { useTranslation } from "../../../hooks/useTranslation";
import { Filter, X, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
	const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

	return (
		<div className='flex flex-col lg:flex-row gap-6 relative'>
			{/* MOBILE TOP CONTROLS */}
			<div className='lg:hidden order-1 flex w-full gap-2 items-center mb-[-0.5rem] relative z-20'>
				<Button
					variant='outline'
					onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
					className='flex-1 justify-center bg-surface-bg border-border text-xs sm:text-sm'
				>
					{isMobilePanelOpen ? (
						<X size={16} className='mr-2' />
					) : (
						<Filter size={16} className='mr-2' />
					)}
					{isMobilePanelOpen
						? tUI("common.close")
						: tUI("common.filter")}
				</Button>
				{sidePanelProps?.onAddNew && (
					<Button
						onClick={sidePanelProps.onAddNew}
						className='flex-1 justify-center text-xs sm:text-sm'
					>
						<Plus size={16} className='mr-2' />
						{sidePanelProps.addLabel || tUI("common.addNew")}
					</Button>
				)}
			</div>

			{/* MOBILE COLLAPSIBLE SIDE PANEL */}
			<AnimatePresence>
				{isMobilePanelOpen && (
					<motion.div
						key='mobile-panel'
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className='lg:hidden order-2 overflow-hidden'
					>
						<div className='pt-2'>
							{/* Pass all props to SidePanel; it will just render the inputs */}
							{/* Note: since mobile top controls already show AddNew, we can hide the SidePanel's inner AddNew via CSS if we want, but it's okay to leave it for now or explicitly pass a flag, but SidePanel doesn't have an hideAddNew flag. We'll leave it. */}
							<SidePanel {...sidePanelProps} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* MAIN LIST LAYOUT */}
			<div className='lg:w-4/5 bg-surface-bg rounded-lg p-3 sm:p-4 order-3 lg:order-none'>
				{dataLength > 0 ? (
					children
				) : (
					<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
						<div>
							<p className='font-semibold text-lg'>
								{emptyMessageTitle || tUI("common.notFound")}
							</p>
							<p>{emptyMessageSub || tUI("admin.rune.tryOtherFilter")}</p>
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
							{tUI("common.prev")}
						</Button>
						<span className='text-lg font-medium text-text-primary'>
							{currentPage} / {totalPages}
						</span>
						<Button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							variant='outline'
						>
							{tUI("common.next")}
						</Button>
					</div>
				)}
			</div>

			{/* DESKTOP STICKY SIDE PANEL */}
			<div className='hidden lg:block lg:w-1/5 shrink-0 order-none'>
				<div className='sticky top-20'>
					<SidePanel {...sidePanelProps} />
				</div>
			</div>
		</div>
	);
};

export default AdminListLayout;
