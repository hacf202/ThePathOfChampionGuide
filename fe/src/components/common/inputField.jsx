// src/components/common/InputField.jsx
import React from "react";

const InputField = ({ label, error, rightIcon, className, ...props }) => {
	return (
		<div className='w-full'>
			{label && (
				<label className='block text-sm font-medium text-text-primary'>
					{label}
				</label>
			)}
			<div className='relative'>
				<input
					{...props}
					className={`w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
            placeholder:text-input-placeholder
            focus:border-input-focus-border focus:ring-0 focus:outline-none 
            transition-colors duration-200
            disabled:bg-input-disabled-bg disabled:text-input-disabled-text
            ${className}`}
				/>
				{rightIcon && (
					<div className='absolute inset-y-0 right-0 flex items-center pr-3'>
						{rightIcon}
					</div>
				)}
			</div>
			{error && <p className='mt-1 text-xs text-danger-text-dark'>{error}</p>}
		</div>
	);
};

export default InputField;
