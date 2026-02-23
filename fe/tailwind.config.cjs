/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			// 1. FONT (Giữ nguyên)
			fontFamily: {
				primary: ["var(--font-primary)", "sans-serif"],
				secondary: ["var(--font-secondary)", "sans-serif"],
			},

			// 2. MÀU SẮC (Thêm các biến mới)
			colors: {
				// Thêm vào trong section colors
				"inferno-500": "var(--color-inferno-500)",
				"inferno-title": "var(--color-inferno-title)",
				"inferno-subtitle": "var(--color-inferno-subtitle)",

				"emerald-500": "var(--color-emerald-500)",
				"emerald-title": "var(--color-emerald-title)",
				"emerald-subtitle": "var(--color-emerald-subtitle)",

				"celestial-500": "var(--color-celestial-500)",
				"celestial-title": "var(--color-celestial-title)",
				"celestial-subtitle": "var(--color-celestial-subtitle)",

				"blood-500": "var(--color-blood-500)",
				"blood-title": "var(--color-blood-title)",

				"shadow-500": "var(--color-shadow-500)",
				"shadow-title": "var(--color-shadow-title)",
				// === 1. MÀU CHÍNH & TRẠNG THÁI CƠ BẢN ===
				"primary-500": "var(--color-primary-500)",
				"danger-500": "var(--color-danger-500)",
				warning: "var(--color-warning-text)",
				success: "var(--color-success-text)",

				// === 2. NỀN TRANG & BỀ MẶT CHUNG ===
				"page-bg": "var(--color-page-bg)",
				"surface-bg": "var(--color-surface-bg)",
				"surface-hover": "var(--color-surface-hover-bg)",
				border: "var(--color-border)",

				// === 3. VĂN BẢN CHUNG ===
				"text-primary": "var(--color-text-primary)",
				"text-secondary": "var(--color-text-secondary)",

				// === 4. LỚP PHỦ & HIỆU ỨNG KÍNH (GLASSMORPHISM) ===
				"page-overlay": "var(--color-bg-overlay)",
				"glass-bg": "var(--color-glass-bg)",
				"glass-border": "var(--color-glass-border)",
				"glass-hover-bg": "var(--color-glass-hover-bg)",
				"glass-hover-border": "var(--color-glass-hover-border)",
				"glass-text": "var(--color-glass-dark-text)",

				// === 5. BẢNG ĐIỀU KHIỂN KÍNH (PANEL GLASS) ===
				"panel-glass-bg": "var(--color-panel-glass-bg)",
				"panel-glass-border": "var(--color-panel-glass-border)",
				"panel-text-light": "var(--color-panel-text-light)",
				"panel-text-dim": "var(--color-panel-text-dim)",
				"panel-text-dimmer": "var(--color-panel-text-dimmer)",
				"panel-item-bg": "var(--color-panel-item-bg)",
				"panel-item-hover-bg": "var(--color-panel-item-hover-bg)",
				"panel-input-bg": "var(--color-panel-input-bg)",
				"panel-input-border": "var(--color-panel-input-border)",
				"panel-checkbox-bg": "var(--color-panel-checkbox-bg)",
				"panel-checkbox-border": "var(--color-panel-checkbox-border)",

				// === 6. TRẠNG THÁI BÁO ĐỘNG (DANGER) ===
				"danger-bg-light": "var(--color-danger-bg-light)",
				"danger-text-dark": "var(--color-danger-text-dark)",

				// === 7. NÚT BẤM (BUTTON VARIANTS) ===
				// Primary
				"btn-primary-bg": "var(--color-btn-primary-bg)",
				"btn-primary-text": "var(--color-btn-primary-text)",
				"btn-primary-hover-bg": "var(--color-btn-primary-hover-bg)",

				// Accent
				"btn-accent-bg": "var(--color-btn-accent-bg)",
				"btn-accent-text": "var(--color-btn-accent-text)",
				"btn-accent-hover-bg": "var(--color-btn-accent-hover-bg)",

				// Secondary
				"btn-secondary-bg": "var(--color-btn-secondary-bg)",
				"btn-secondary-text": "var(--color-btn-secondary-text)",
				"btn-secondary-border": "var(--color-btn-secondary-border)",
				"btn-secondary-hover-bg": "var(--color-btn-secondary-hover-bg)",
				"btn-secondary-hover-text": "var(--color-btn-secondary-hover-text)",

				// Danger
				"btn-danger-bg": "var(--color-btn-danger-bg)",
				"btn-danger-text": "var(--color-btn-danger-text)",
				"btn-danger-hover-bg": "var(--color-btn-danger-hover-bg)",

				// Warning
				"btn-warning-bg": "var(--color-btn-warning-bg)",
				"btn-warning-text": "var(--color-btn-warning-text)",
				"btn-warning-hover-bg": "var(--color-btn-warning-hover-bg)",

				// === 8. BIỂU MẪU (FORM INPUTS) ===
				"input-bg": "var(--color-input-bg)",
				"input-text": "var(--color-input-text)",
				"input-border": "var(--color-input-border)",
				"input-placeholder": "var(--color-input-placeholder)",
				"input-focus-border": "var(--color-input-focus-border)",
				"input-disabled-bg": "var(--color-input-disabled-bg)",
				"input-disabled-text": "var(--color-input-disabled-text)",

				"input-error-border": "var(--color-input-error-border)",
				"input-error-text": "var(--color-input-error-text)",

				"text-success": "var(--color-success-text)",
				"text-warning": "var(--color-warning-text)",

				// === 9. DROPDOWN ===
				"dropdown-bg": "var(--color-dropdown-bg)",
				"dropdown-border": "var(--color-dropdown-border)",
				"dropdown-item-text": "var(--color-dropdown-item-text)",
				"dropdown-item-hover-bg": "var(--color-dropdown-item-hover-bg)",
				"dropdown-item-selected-bg": "var(--color-dropdown-item-selected-bg)",

				// === 10. MODAL ===
				"modal-overlay-bg": "var(--color-modal-overlay-bg)",

				// === 11. HEADER & NAVBAR ===
				"header-bg": "var(--color-header-bg)",
				"header-text": "var(--color-header-text)",
				"header-border": "var(--color-header-border)",
				"nav-link-text": "var(--color-nav-link-text)",
				"nav-link-hover": "var(--color-nav-link-hover)",
				"nav-link-selected": "var(--color-nav-link-selected)",
				"nav-hover-bg": "var(--color-nav-hover-bg)",
				"nav-active-bg": "var(--color-nav-active-bg)",

				// === 12. FOOTER ===
				"footer-bg": "var(--color-footer-bg)",
				"footer-text": "var(--color-footer-text)",
				"footer-link": "var(--color-footer-link)",
				"footer-link-hover": "var(--color-footer-link-hover)",

				// === 13. ICONS ===
				"icon-star": "var(--color-icon-star)",
				"icon-power": "var(--color-icon-power)",
				"icon-gem": "var(--color-icon-gem)",
				"icon-random": "var(--color-icon-random)",

				// === 14. MÀU ĐẶC THÙ THEO TRANG (Home.jsx) ===
				// Accent Sections
				"accent1-title": "var(--color-accent1-title)",
				"accent1-subtitle": "var(--color-accent1-subtitle)",
				"accent1-cta-bg": "var(--color-accent1-cta-bg)",
				"accent1-cta-hover": "var(--color-accent1-cta-hover)",
				"accent1-badge-bg": "var(--color-accent1-badge-bg)",

				"accent2-title": "var(--color-accent2-title)",
				"accent2-subtitle": "var(--color-accent2-subtitle)",
				"accent2-cta-bg": "var(--color-accent2-cta-bg)",
				"accent2-cta-hover": "var(--color-accent2-cta-hover)",

				"accent3-title": "var(--color-accent3-title)",
				"accent3-subtitle": "var(--color-accent3-subtitle)",
				"accent3-cta-bg": "var(--color-accent3-cta-bg)",
				"accent3-cta-hover": "var(--color-accent3-cta-hover)",

				// Role Colors
				"role-aggro": "var(--color-role-aggro)",
				"role-combo": "var(--color-role-combo)",
				"role-mill": "var(--color-role-mill)",
				"role-control": "var(--color-role-control)",
				"role-midrange": "var(--color-role-midrange)",
				"role-burn": "var(--color-role-burn)",
				"role-ftk-otk": "var(--color-role-ftk-otk)",

				// === 15. KHÁC (LIÊN KẾT ADMIN, v.v.) ===
				"text-link-admin": "var(--color-text-link-admin)",
			},
			/* --- Thêm: Bóng đổ (Shadow) --- */
			boxShadow: {
				"primary-md": "0 8px 24px var(--color-shadow-primary)",
			},
			/* --- Thêm: Fill (cho icon) --- */
			fill: {
				"danger-500": "var(--color-danger-500)",
			},

			// 3. MỞ RỘNG ANIMATION & KEYFRAMES
			keyframes: {
				// (Các keyframes cũ từ Home.jsx đã có trong theme.css)
				// Thêm keyframes MỚI
				slideDown: {
					from: { opacity: "0", transform: "translateY(-10px) scaleY(0.9)" },
					to: { opacity: "1", transform: "translateY(0) scaleY(1)" },
				},
				pulseFocus: {
					"0%, 100%": { boxShadow: "0 0 0 0 rgba(139, 92, 246, 0.4)" },
					"50%": { boxShadow: "0 0 0 4px rgba(139, 92, 246, 0)" },
				},
				spin: {
					from: { transform: "rotate(0deg)" },
					to: { transform: "rotate(360deg)" },
				},
				scaleUp: {
					from: { opacity: "0", transform: "scale(0.95)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
			},
			animation: {
				// (Các class .animate-... đã có trong theme.css)
				// Tạo class tiện ích MỚI
				"slide-down": "slideDown 0.3s ease-out forwards",
				"pulse-focus": "pulseFocus 1.5s ease-in-out infinite",
				"scale-up": "scaleUp 0.2s ease-out forwards",
			},
		},
	},
	plugins: [
		function ({ addUtilities }) {
			addUtilities({
				// Gạch chân active (dày 2px, màu theo text)
				".underline-active::after": {
					content: '""',
					position: "absolute",
					bottom: "0",
					left: "0",
					right: "0",
					height: "2px",
					backgroundColor: "currentColor",
					borderRadius: "1px",
					transition: "all 0.3s ease",
				},
				// Gạch chân mượt hơn (từ giữa ra)
				".underline-active-center::after": {
					content: '""',
					position: "absolute",
					bottom: "0",
					left: "50%",
					transform: "translateX(-50%)",
					width: "0",
					height: "2px",
					backgroundColor: "currentColor",
					borderRadius: "1px",
					transition: "width 0.3s ease",
				},
				".underline-active-center.active::after": {
					width: "100%",
				},
			});
		},
	],
};
