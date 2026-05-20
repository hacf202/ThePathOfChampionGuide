// fe/src/context/AuthContext.jsx
import React, {
	createContext,
	useState,
	useEffect,
	useContext,
} from "react";
import * as authService from "./services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Hàm giải mã JWT payload
const decodeJwtPayload = token => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join(""),
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		console.error("Failed to decode JWT payload:", e);
		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Khôi phục phiên đăng nhập từ localStorage hoặc URL Hash (cho reset password)
	useEffect(() => {
		const checkAuth = async () => {
			// 1. Kiểm tra fragment URL cho reset password token (Supabase recovery flow)
			const hash = window.location.hash;
			let sessionToken = null;
			
			if (hash && hash.includes("access_token=") && hash.includes("type=recovery")) {
				const params = new URLSearchParams(hash.substring(1));
				sessionToken = params.get("access_token");
				if (sessionToken) {
					handleLogin(sessionToken);
					// Xóa hash để URL đẹp hơn
					window.history.replaceState(null, null, window.location.pathname);
				}
			}

			const storedToken = sessionToken || localStorage.getItem("token");
			const storedRefreshToken = localStorage.getItem("refreshToken");

			if (storedToken) {
				const payload = decodeJwtPayload(storedToken);
				const isExpired = payload && payload.exp * 1000 < Date.now();

				if (payload && !isExpired) {
					handleLogin(storedToken, payload);
				} else if (storedRefreshToken) {
					// Thử refresh nếu token cũ hết hạn nhưng có refresh token
					try {
						const data = await authService.refreshSession(storedRefreshToken);
						if (data.token) {
							handleLogin(data.token, null, data.refreshToken);
						} else {
							logout();
						}
					} catch (e) {
						console.error("Session refresh failed", e);
						logout();
					}
				} else {
					logout();
				}
			}
			setIsLoading(false);
		};

		checkAuth();
	}, []);

	// Tự động refresh token trước khi hết hạn 1 phút
	useEffect(() => {
		if (!token) return;

		const payload = decodeJwtPayload(token);
		if (!payload || !payload.exp) return;

		const expiryTimeMs = payload.exp * 1000;
		const timeUntilExpiryMs = expiryTimeMs - Date.now();

		// Refresh trước khi hết hạn 1 phút (60 giây)
		const bufferMs = 60 * 1000;
		const delayMs = Math.max(1000, timeUntilExpiryMs - bufferMs);

		const timer = setTimeout(async () => {
			const storedRefreshToken = localStorage.getItem("refreshToken");
			if (storedRefreshToken) {
				try {
					const data = await authService.refreshSession(storedRefreshToken);
					if (data.token) {
						handleLogin(data.token, null, data.refreshToken);
					}
				} catch (e) {
					console.error("Auto token refresh failed", e);
				}
			}
		}, delayMs);

		return () => clearTimeout(timer);
	}, [token]);

	const handleLogin = (accessToken, payload = null, refreshToken = null) => {
		localStorage.setItem("token", accessToken);
		if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
		setToken(accessToken);

		const decoded = payload || decodeJwtPayload(accessToken);
		if (decoded) {
			setUser({
				sub: decoded.sub,
				username: decoded.user_metadata?.username || decoded.email?.split("@")[0],
				name: decoded.user_metadata?.name || decoded.email?.split("@")[0],
				email: decoded.email,
			});
			setIsAdmin((decoded.app_metadata?.groups || []).includes("admin"));
		}
	};

	const login = async (email, password, onSuccess, onError) => {
		try {
			const data = await authService.initiateAuth(email, password);
			if (data.token) {
				handleLogin(data.token, null, data.refreshToken);
				onSuccess("Đăng nhập thành công!");
			}
		} catch (error) {
			onError(error.message);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setIsAdmin(false);
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
	};

	const signUp = async (username, displayName, email, password, onSuccess, onError) => {
		try {
			await authService.signUp(email, password, username, displayName);
			onSuccess("Đăng ký thành công! Vui lòng đăng nhập hoặc kiểm tra email.");
		} catch (error) {
			onError(error.message);
		}
	};

	const forgotPassword = async (username, email, onSuccess, onError) => {
		try {
			const data = await authService.forgotPassword(email);
			onSuccess(data.message);
		} catch (error) {
			onError(error.message);
		}
	};

	const confirmPasswordReset = async (
		email,
		code,
		newPassword,
		onSuccess,
		onError,
	) => {
		try {
			await authService.confirmPasswordReset(email, code, newPassword);
			onSuccess("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.");
		} catch (error) {
			onError(error.message);
		}
	};

	const changeName = async (newName, onSuccess, onError) => {
		try {
			const data = await authService.changeName(newName, token);
			setUser(prev => (prev ? { ...prev, name: newName } : null));
			onSuccess(data.message);
		} catch (err) {
			onError(err.message || "Không thể đổi tên");
		}
	};

	const changePassword = async (
		oldPassword,
		newPassword,
		onSuccess,
		onError,
	) => {
		if (!token) {
			onError("Không tìm thấy access token");
			return;
		}

		try {
			const data = await authService.changePassword(
				oldPassword,
				newPassword,
				token,
				token,
			);
			onSuccess(data.message);
		} catch (err) {
			onError(err.message || "Không thể đổi mật khẩu");
		}
	};

	const resetPassword = async (newPassword) => {
		if (!token) throw new Error("Phiên làm việc đã hết hạn. Vui lòng nhấp lại vào link trong email.");
		
		try {
			const data = await authService.resetPassword(newPassword, token);
			return data;
		} catch (error) {
			throw error;
		}
	};

	const getUserNameBySub = async sub => {
		try {
			const data = await authService.getUserNameBySub(sub);
			return data.name;
		} catch (error) {
			console.error("Error fetching user name by sub:", error);
			return null;
		}
	};

	// Xóa các placeholder cho code thừa, giữ lại reference để các component khác không bị crash nếu lỡ gọi
	const confirmSignUp = async () => {};
	const resendConfirmationCode = async () => {};

	const value = {
		user,
		token,
		accessToken: token, // Alias để tương thích
		isAdmin,
		isLoading,
		login,
		logout,
		signUp,
		confirmSignUp,
		resendConfirmationCode,
		forgotPassword,
		confirmPasswordReset,
		changeName,
		changePassword,
		resetPassword,
		getUserNameBySub,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
