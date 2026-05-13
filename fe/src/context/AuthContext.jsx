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

	// Khôi phục phiên đăng nhập từ localStorage khi F5 trang
	useEffect(() => {
		const storedToken = localStorage.getItem("token");

		if (storedToken) {
			const payload = decodeJwtPayload(storedToken);
			if (payload && payload.exp * 1000 > Date.now()) {
				handleLogin(storedToken, payload);
			} else {
				logout();
			}
		}
		setIsLoading(false);
	}, []);

	const handleLogin = (accessToken, payload = null) => {
		localStorage.setItem("token", accessToken);
		setToken(accessToken);

		const decoded = payload || decodeJwtPayload(accessToken);
		if (decoded) {
			setUser({
				sub: decoded.sub,
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
				handleLogin(data.token);
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
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
	};

	const signUp = async (username, email, password, onSuccess, onError) => {
		try {
			await authService.signUp(email, password, username);
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
		getUserNameBySub,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
