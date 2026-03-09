// src/components/common/dropdownFilter.jsx

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

function DropdownFilter({
	label,
	options,
	selectedValue,
	onChange,
	placeholder,
	renderOption,
}) {
	const { tUI } = useTranslation(); // 🟢 Khởi tạo Hook
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// 🟢 Xử lý placeholder đa ngôn ngữ bằng tUI
	const finalPlaceholder = placeholder || tUI("common.selectOption");

	const handleSelect = value => {
		onChange(value);
		setIsOpen(false);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownRef]);

	const displayedLabel =
		(selectedValue &&
			options.find(opt => opt.value === selectedValue)?.label) ||
		finalPlaceholder;

	return (
		<div className='relative w-full' ref={dropdownRef}>
			{label && (
				<label className='block text-sm font-medium mb-1 text-text-secondary'>
					{label}
				</label>
			)}
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex justify-between items-center p-2 bg-input-bg text-input-text rounded-md border border-input-border
        text-left   duration-200 cursor-pointer
        focus:outline-none focus:ring-0 focus:border-input-focus-border
        hover:border-input-focus-border'
			>
				<span className='truncate'>{displayedLabel}</span>
				<ChevronDown
					size={20}
					className={`text-text-secondary transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className='absolute z-10 w-full mt-1 bg-dropdown-bg border border-dropdown-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-slide-down'>
					{options.map((option, index) => {
						const isSelected = selectedValue === option.value;
						return (
							<button
								type='button'
								key={`${option.value}-${index}`}
								onClick={() => handleSelect(option.value)}
								aria-selected={isSelected}
								className='w-full text-left p-2 text-dropdown-item-text hover:bg-dropdown-item-hover-bg aria-selected:bg-dropdown-item-selected-bg cursor-pointer flex items-center justify-between'
							>
								<span>
									{renderOption ? renderOption(option) : option.label}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default DropdownFilter;
