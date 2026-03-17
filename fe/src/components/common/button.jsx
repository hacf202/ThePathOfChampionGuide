import React from "react";

/**
 * Component Button chung, hỗ trợ nhiều kiểu dáng và icon.
 *
 * @param {('primary'|'secondary'|'danger'|'warning'|'ghost'|'outline')} [variant='primary'] - Kiểu dáng của nút.
 * @param {string} [type='button'] - Loại của nút, mặc định là 'button' để tránh gửi form ngoài ý muốn.
 * @param {React.ReactNode} children - Nội dung văn bản của nút.
 * @param {React.ReactNode} [iconLeft] - Icon hiển thị bên trái văn bản.
 * @param {React.ReactNode} [iconRight] - Icon hiển thị bên phải văn bản.
 * @param {string} [className=''] - Các class Tailwind CSS bổ sung.
 * @param {boolean} [disabled=false] - Trạng thái vô hiệu hóa.
 * @param {...object} props - Các props khác của thẻ <button> (ví dụ: onClick).
 */
const Button = ({
	variant = "primary",
	type = "button",
	children,
	iconLeft,
	iconRight,
	className = "",
	disabled = false,
	...props
}) => {
	// --- STYLES ---
	// 'focus:ring-offset-surface-bg' đảm bảo vòng focus có nền đúng (ví dụ: trắng)
	const baseStyles =
		"inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-bg disabled:opacity-50 disabled:cursor-not-allowed";

	const getVariantStyles = variant => {
		switch (variant) {
			case "primary":
				return "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg focus:ring-primary-500";

			// 'secondary' và 'outline' giờ là một
			case "secondary":
			case "outline":
				return "bg-btn-secondary-bg text-btn-secondary-text border border-btn-secondary-border hover:bg-btn-secondary-hover-bg hover:text-btn-secondary-hover-text focus:ring-primary-500";

			case "danger":
				return "bg-btn-danger-bg text-btn-danger-text hover:bg-btn-danger-hover-bg focus:ring-danger-500";

			case "warning":
				return "bg-btn-warning-bg text-btn-warning-text hover:bg-btn-warning-hover-bg focus:ring-warning-500";

			case "ghost":
				return "bg-btn-ghost-bg text-btn-ghost-text hover:bg-btn-ghost-hover-bg focus:ring-primary-500";

			default:
				return "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg focus:ring-primary-500";
		}
	};

	const variantStyles = getVariantStyles(variant);

	return (
		<button
			type={type}
			className={`${baseStyles} ${variantStyles} ${className}`}
			disabled={disabled}
			{...props}
		>
			{iconLeft && <span className='mr-2'>{iconLeft}</span>}
			{children}
			{iconRight && <span className='ml-2'>{iconRight}</span>}
		</button>
	);
};

export default Button;
