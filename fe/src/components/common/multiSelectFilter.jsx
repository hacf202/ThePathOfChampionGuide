// src/components/common/multiSelectFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import SafeImage from "./SafeImage";
import { useTranslation } from "../../hooks/useTranslation";

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
			<span className='truncate text-sm font-medium'>
				{option.label || option.value}
			</span>
		</div>
	);

	const displayContent =
		selectedValues.length === 0 ? (
			<span className='text-text-tertiary truncate'>{currentPlaceholder}</span>
		) : selectedValues.length <= 2 ? (
			<span className='truncate text-text-primary'>
				{selectedValues
					.map(val => options.find(opt => opt.value === val)?.label || val)
					.filter(Boolean)
					.join(", ")}
			</span>
		) : (
			<span className='text-primary-500 font-bold'>
				{tUI("common.selectedItems").replace(
					"{{count}}",
					selectedValues.length,
				)}
			</span>
		);

	return (
		<div className='relative w-full select-none' ref={wrapperRef}>
			{label && (
				<label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 ml-1'>
					{label}
				</label>
			)}
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex justify-between items-center px-3 py-2 bg-input-bg border rounded-lg text-left 
                text-text-primary min-h-[42px] transition-all duration-200
                ${isOpen ? "border-primary-500 ring-2 ring-primary-500/20 shadow-sm" : "border-border hover:border-border-hover"}`}
			>
				<div className='flex-grow overflow-hidden mr-2'>{displayContent}</div>
				<ChevronDown
					size={18}
					className={`transition-transform duration-300 flex-shrink-0 text-text-tertiary ${
						isOpen ? "rotate-180 text-primary-500" : ""
					}`}
				/>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className='absolute z-[99] w-full mt-1.5 bg-surface-bg border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto animate-slide-down custom-scrollbar'>
					{options.length > 0 ? (
						<div className='py-1'>
							{options.map(option => {
								const isSelected = selectedValues.includes(option.value);
								return (
									<div
										key={option.value}
										onClick={() => handleSelect(option.value)}
										className={`flex items-center justify-between px-3 py-2.5 mx-1 my-0.5 rounded-md cursor-pointer   ${
											isSelected
												? "bg-primary-500/10 text-primary-500"
												: "text-text-primary hover:bg-surface-hover"
										}`}
									>
										{renderOptionContent(option)}
										{isSelected && (
											<Check
												size={16}
												className='text-primary-500 flex-shrink-0 ml-2'
											/>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className='p-4 text-center text-sm text-text-tertiary italic'>
							{tUI("common.notFound") || "No options"}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default MultiSelectFilter;
