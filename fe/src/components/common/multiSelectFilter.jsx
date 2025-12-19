// src/components/common/MultiSelectFilter.jsx (ĐÃ THÊM ICON TIÊU HAO)

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Star, Tag } from "lucide-react"; // <-- 1. THÊM IMPORT 'Droplet'
import SafeImage from "./SafeImage";

const MultiSelectFilter = ({
	label,
	options,
	selectedValues = [],
	onChange,
	placeholder = "Chọn một hoặc nhiều",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [wrapperRef]);

	const handleSelect = value => {
		const newSelectedValues = selectedValues.includes(value)
			? selectedValues.filter(v => v !== value)
			: [...selectedValues, value];
		onChange(newSelectedValues);
	};

	// --- Render option in dropdown ---
	const renderOptionContent = option => (
		<div className='flex items-center gap-2'>
			{option.iconComponent}
			{option.iconUrl && (
				<SafeImage
					src={option.iconUrl}
					alt={option.label}
					className='w-5 h-5 flex-shrink-0'
					fallback='/fallback-image.svg'
				/>
			)}
			{option.isCost && (
				<div className='text-white absolute w-5 h-5 flex items-center justify-center bg-blue-600 border-2 rounded-full text-xs'>
					{option.value}
				</div>
			)}
			{option.isStar && (
				<div className='flex items-center gap-1'>
					<span className='text-sm font-medium'>{option.value}</span>
					<Star size={16} className='text-icon-star' />
				</div>
			)}
			{option.isTag && <Tag size={16} className='text-text-secondary' />}
			{option.label}
		</div>
	);

	// --- Render selected chip content ---
	const renderSelectedChip = option => (
		// Sử dụng class ngữ nghĩa (bg-input-bg cho chip)
		<div className='flex items-center gap-1 bg-input-bg px-2 py-0.5 rounded'>
			{option.iconComponent}
			{option.iconUrl && (
				<SafeImage
					src={option.iconUrl}
					alt={option.label}
					className='w-5 h-5 flex-shrink-0'
					fallback='/fallback-image.svg'
				/>
			)}
			{option.isCost && (
				<div className='text-white absolute w-5 h-5 flex items-center justify-center bg-blue-600 border-2 rounded-full text-xs'>
					{option.value}
				</div>
			)}
			{option.isStar && (
				<div className='flex items-center gap-1'>
					<span className='text-xs font-medium'>{option.value}</span>
					<Star size={12} className='text-icon-star' />
				</div>
			)}
			{option.label && <span className='text-sm'>{option.label}</span>}
		</div>
	);

	// --- Phần còn lại của component không thay đổi ---
	const displayContent =
		selectedValues.length > 0 ? (
			<div className='flex items-center gap-x-2 flex-wrap'>
				{options
					.filter(o => selectedValues.includes(o.value))
					.map(option => (
						<div key={option.value}>{renderSelectedChip(option)}</div>
					))}
			</div>
		) : (
			<span className='text-text-secondary'>{placeholder}</span>
		);

	return (
		<div className='relative' ref={wrapperRef}>
			<label className='block text-sm font-medium text-text-secondary'>
				{label}
			</label>
			{/* Đồng bộ style với InputField */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex justify-between items-center p-2 bg-input-bg border border-input-border rounded-md text-left 
        text-text-primary min-h-[42px]
        hover:border-input-focus-border'
			>
				<div className='flex-grow'>{displayContent}</div>
				<ChevronDown
					size={20}
					className={`transition-transform flex-shrink-0 text-text-secondary ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				// Đồng bộ style Dropdown
				<div className='absolute z-10 w-full mt-1 bg-dropdown-bg border border-dropdown-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-slide-down'>
					{options.map(option => (
						<div
							key={option.value}
							onClick={() => handleSelect(option.value)}
							className='flex items-center justify-between p-3 text-dropdown-item-text hover:bg-dropdown-item-hover-bg cursor-pointer'
						>
							{renderOptionContent(option)}
							{selectedValues.includes(option.value) && (
								<Check size={20} className='text-primary-500' />
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MultiSelectFilter;
