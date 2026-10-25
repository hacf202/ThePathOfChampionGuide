// src/components/common/multiSelectFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import SafeImage from "./SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

const MultiSelectFilter = ({
	label,
	options = [],
	selectedValues = [],
	onChange,
	placeholder,
}) => {
	const { tUI } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef(null);

	const currentPlaceholder = placeholder || tUI("common.selectPlaceholder");

	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = value => {
		const newSelectedValues = selectedValues.includes(value)
			? selectedValues.filter(v => v !== value)
			: [...selectedValues, value];
		onChange(newSelectedValues);
	};

	const renderOptionContent = option => (
		<div className='flex items-center gap-2 overflow-hidden py-0.5'>
			{option.iconComponent}
			{option.iconUrl && (
				<SafeImage
					src={option.iconUrl}
					alt={option.label || ""}
					className='w-5 h-5 object-contain flex-shrink-0'
				/>
			)}
			<span className='truncate text-xs font-mono-tech uppercase font-medium'>
				{option.label || option.value}
			</span>
		</div>
	);

	const displayContent =
		selectedValues.length === 0 ? (
			<span className='tactical-text-dim text-xs font-mono-tech truncate'>{currentPlaceholder}</span>
		) : selectedValues.length <= 2 ? (
			<span className='truncate tactical-text-main text-xs font-mono-tech font-bold'>
				{selectedValues
					.map(val => options.find(opt => opt.value === val)?.label || val)
					.filter(Boolean)
					.join(", ")}
			</span>
		) : (
			<span className='tactical-accent-lime font-mono-tech font-bold text-xs'>
				{tUI("common.selectedItems").replace(
					"{{count}}",
					selectedValues.length,
				)}
			</span>
		);

	return (
		<div className='relative w-full select-none' ref={wrapperRef}>
			{label && (
				<label className='block text-[11px] font-mono-tech font-bold uppercase tracking-wider tactical-text-dim mb-1.5 ml-1'>
					{label}
				</label>
			)}
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex justify-between items-center px-3.5 py-2 tactical-card border clip-chamfer-sm text-left 
                tactical-text-main min-h-[42px] transition-all duration-200
                ${isOpen ? "!border-[var(--tactical-accent-cyan)] shadow-[0_0_15px_rgba(0,245,212,0.25)]" : "hover:border-[var(--tactical-accent-lime)]"}`}
			>
				<div className='flex-grow overflow-hidden mr-2 font-sans'>{displayContent}</div>
				<ChevronDown
					size={18}
					className={`transition-transform duration-300 flex-shrink-0 tactical-text-dim ${
						isOpen ? "rotate-180 tactical-accent-cyan" : ""
					}`}
				/>
			</button>

			{/* Dropdown Menu chuẩn Tactical Panel */}
			{isOpen && (
				<div className='absolute z-[100] w-full mt-1.5 tactical-panel border-2 border-[var(--tactical-section-border)] rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-slide-down-scrollbar backdrop-blur-xl'>
					{options.length > 0 ? (
						<div className='py-1 p-1'>
							{options.map(option => {
								const isSelected = selectedValues.includes(option.value);
								return (
									<div
										key={option.value}
										onClick={() => handleSelect(option.value)}
										className={`flex items-center justify-between px-3 py-2 my-0.5 clip-chamfer-sm cursor-pointer transition-colors ${
											isSelected
												? "bg-[var(--tactical-accent-lime)]/15 text-[var(--tactical-accent-lime)] font-bold border border-[var(--tactical-accent-lime)]/30"
												: "tactical-text-main hover:bg-[var(--tactical-accent-cyan)]/10 hover:text-[var(--tactical-accent-cyan)]"
										}`}
									>
										{renderOptionContent(option)}
										{isSelected && (
											<Check
												size={16}
												className='text-[var(--tactical-accent-lime)] flex-shrink-0 ml-2'
											/>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className='p-4 text-center text-sm tactical-text-dim italic'>
							{tUI("common.notFound") || "No options"}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default MultiSelectFilter;
