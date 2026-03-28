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

			// 2. MÀU SẮC
			colors: {
				// Theme đa dạng (Inferno, Emerald, Celestial, Blood, Shadow)
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

				// Màu chính (đầy đủ dải)
				"primary-100": "var(--color-primary-100)",
				"primary-300": "var(--color-primary-300)",
				"primary-400": "var(--color-primary-400)",
				"primary-500": "var(--color-primary-500)",
				"primary-600": "var(--color-primary-600)",
				"primary-700": "var(--color-primary-700)",
				// Trạng thái
				"danger-500": "var(--color-danger-500)",
				warning: "var(--color-warning-text)",
				success: "var(--color-success-text)",

				// Nền & Bề mặt
				"page-bg": "var(--color-page-bg)",
				"surface-bg": "var(--color-surface-bg)",
				"surface-hover": "var(--color-surface-hover-bg)",
				border: "var(--color-border)",
				"border-hover": "var(--color-border-hover)",

				// Văn bản
				"text-primary": "var(--color-text-primary)",
				"text-secondary": "var(--color-text-secondary)",

				// Glassmorphism
				"page-overlay": "var(--color-bg-overlay)",
				"glass-bg": "var(--color-glass-bg)",
				"glass-border": "var(--color-glass-border)",
				"glass-hover-bg": "var(--color-glass-hover-bg)",
				"glass-hover-border": "var(--color-glass-hover-border)",
				"glass-text": "var(--color-glass-dark-text)",

				// Panel Glass
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

				// Danger State
				"danger-bg-light": "var(--color-danger-bg-light)",
				"danger-text-dark": "var(--color-danger-text-dark)",

				// Buttons
				"btn-primary-bg": "var(--color-btn-primary-bg)",
				"btn-primary-text": "var(--color-btn-primary-text)",
				"btn-primary-hover-bg": "var(--color-btn-primary-hover-bg)",
				"btn-secondary-bg": "var(--color-btn-secondary-bg)",
				"btn-secondary-text": "var(--color-btn-secondary-text)",
				"btn-secondary-border": "var(--color-btn-secondary-border)",
				"btn-secondary-hover-bg": "var(--color-btn-secondary-hover-bg)",
				"btn-secondary-hover-text": "var(--color-btn-secondary-hover-text)",
				"btn-danger-bg": "var(--color-btn-danger-bg)",
				"btn-danger-text": "var(--color-btn-danger-text)",
				"btn-danger-hover-bg": "var(--color-btn-danger-hover-bg)",
				"btn-warning-bg": "var(--color-btn-warning-bg)",
				"btn-warning-text": "var(--color-btn-warning-text)",
				"btn-warning-hover-bg": "var(--color-btn-warning-hover-bg)",

				// Forms
				"input-bg": "var(--color-input-bg)",
				"input-text": "var(--color-input-text)",
				"input-border": "var(--color-input-border)",
				"input-placeholder": "var(--color-input-placeholder)",
				"input-focus-border": "var(--color-input-focus-border)",
				"input-disabled-bg": "var(--color-input-disabled-bg)",
				"input-disabled-text": "var(--color-input-disabled-text)",
				"input-error-border": "var(--color-input-error-border)",
				"input-error-text": "var(--color-input-error-text)",

				// Dropdown & Modal
				"dropdown-bg": "var(--color-dropdown-bg)",
				"dropdown-border": "var(--color-dropdown-border)",
				"dropdown-item-text": "var(--color-dropdown-item-text)",
				"dropdown-item-hover-bg": "var(--color-dropdown-item-hover-bg)",
				"dropdown-item-selected-bg": "var(--color-dropdown-item-selected-bg)",
				"modal-overlay-bg": "var(--color-modal-overlay-bg)",

				// Header & Navbar
				"header-bg": "var(--color-header-bg)",
				"header-text": "var(--color-header-text)",
				"header-border": "var(--color-header-border)",
				"nav-link-text": "var(--color-nav-link-text)",
				"nav-hover-bg": "var(--color-nav-hover-bg)",
				// Footer
				"footer-bg": "var(--color-footer-bg)",
				"footer-text": "var(--color-footer-text)",
				"footer-link": "var(--color-footer-link)",
				"footer-link-hover": "var(--color-footer-link-hover)",

				// Admin link
				"text-link-admin": "var(--color-text-link-admin)",
				// Icons & Roles
				"icon-star": "var(--color-icon-star)",
				"role-aggro": "var(--color-role-aggro)",
				"role-combo": "var(--color-role-combo)",
				"role-mill": "var(--color-role-mill)",
				"role-control": "var(--color-role-control)",
				"role-midrange": "var(--color-role-midrange)",
				"role-burn": "var(--color-role-burn)",
				"role-ftk-otk": "var(--color-role-ftk-otk)",
			},

			// 3. HIỆU ỨNG (Shadow, Fill)
			boxShadow: {
				"primary-md": "0 8px 24px var(--color-shadow-primary)",
			},
			fill: {
				"danger-500": "var(--color-danger-500)",
			},

			// 4. KEYFRAMES
			keyframes: {
				slideDown: {
					from: { opacity: "0", transform: "translateY(-10px) scaleY(0.9)" },
					to: { opacity: "1", transform: "translateY(0) scaleY(1)" },
				},
				pulseFocus: {
					"0%, 100%": { boxShadow: "0 0 0 0 rgba(60, 145, 194, 0.4)" },
					"50%": { boxShadow: "0 0 0 4px rgba(60, 145, 194, 0)" },
				},
				spin: {
					from: { transform: "rotate(0deg)" },
					to: { transform: "rotate(360deg)" },
				},
				scaleUp: {
					from: { opacity: "0", transform: "scale(0.95)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
				// Keyframes Loading mới bổ sung
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				ripplePulse: {
					"0%": { boxShadow: "0 0 0 0 rgba(60, 145, 194, 0.4)" },
					"70%": { boxShadow: "0 0 0 20px rgba(60, 145, 194, 0)" },
					"100%": { boxShadow: "0 0 0 0 rgba(60, 145, 194, 0)" },
				},
			},

			// 5. ANIMATION CLASSES
			animation: {
				"slide-down": "slideDown 0.3s ease-out forwards",
				"pulse-focus": "pulseFocus 1.5s ease-in-out infinite",
				"scale-up": "scaleUp 0.2s ease-out forwards",
				"spin-slow": "spin 3s linear infinite",
				// Animation Loading tiện ích mới bổ sung
				shimmer: "shimmer 1.5s infinite linear",
				"ripple-pulse": "ripplePulse 2s infinite",
			},
		},
	},
	plugins: [
		function ({ addUtilities }) {
			addUtilities({
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
