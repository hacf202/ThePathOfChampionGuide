// src/components/common/dropdownFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

function DropdownFilter({
	label,
	options,
	selectedValue,
	onChange,
	placeholder,
	renderOption,
}) {
	const { tUI } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

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
				<span className='truncate font-sans text-xs sm:text-sm font-medium'>{displayedLabel}</span>
				<ChevronDown
					size={18}
					className={`tactical-text-dim transition-transform ${
						isOpen ? "rotate-180 tactical-accent-cyan" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className='absolute z-[100] w-full mt-1.5 tactical-panel border-2 border-[var(--tactical-section-border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slide-down-scrollbar backdrop-blur-xl'>
					<div className="py-1 p-1">
						{options.map((option, index) => {
							const isSelected = selectedValue === option.value;
							return (
								<button
									type='button'
									key={`${option.value}-${index}`}
									onClick={() => handleSelect(option.value)}
									aria-selected={isSelected}
									className={`w-full text-left px-3 py-2 my-0.5 clip-chamfer-sm cursor-pointer transition-colors flex items-center justify-between text-xs font-mono-tech uppercase ${
										isSelected
											? "bg-[var(--tactical-accent-lime)]/15 text-[var(--tactical-accent-lime)] font-bold border border-[var(--tactical-accent-lime)]/30"
											: "tactical-text-main hover:bg-[var(--tactical-accent-cyan)]/10 hover:text-[var(--tactical-accent-cyan)]"
									}`}
								>
									<span>
										{renderOption ? renderOption(option) : option.label}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default DropdownFilter;
