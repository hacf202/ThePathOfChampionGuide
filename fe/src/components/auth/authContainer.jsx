import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import { ChevronLeft } from "lucide-react";
import Button from "../common/button.jsx";
import PageTitle from "../common/pageTitle";
import { useTranslation } from "../../hooks/useTranslation";

const AuthContainer = () => {
	const { tUI } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();

	// Đồng bộ trạng thái view với URL: ?mode=login hoặc ?mode=register
	const mode = searchParams.get("mode") || "login";
	const isLoginView = mode === "login";

	const showBackButton = location.key !== "default";

	const handleLoginSuccess = () => navigate("/builds");
	const handleRegisterSuccess = () => setSearchParams({ mode: "login" });

	const switchToRegister = () => setSearchParams({ mode: "register" });
	const switchToLogin = () => setSearchParams({ mode: "login" });

	const handleBack = () => {
		if (showBackButton) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	return (
		<div>
			<PageTitle title={tUI("auth.loginRegisterTitle")} />
			<div className='flex justify-center min-h-screen p-4 pt-16 sm:pt-20 font-secondary'>
				<div className='w-full max-w-lg'>
					{showBackButton && (
						<div className='mb-4'>
							<Button onClick={handleBack} variant='outline'>
								<ChevronLeft size={18} />
								{tUI("common.back")}
							</Button>
						</div>
					)}

					<div className='flex mb-0'>
						<button
							onClick={switchToLogin}
							className={`relative flex-1 py-3 px-4 font-primary font-bold text-lg rounded-t-xl transition-all duration-300 ease-in-out
              ${
								isLoginView
									? "bg-surface-bg text-text-primary shadow-inner-top"
									: "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active"
							}`}
						>
							{tUI("auth.login")}
							{isLoginView && (
								<span className='absolute bottom-0 left-0 w-full h-1 bg-primary-500'></span>
							)}
						</button>

						<button
							onClick={switchToRegister}
							className={`relative flex-1 py-3 px-4 font-primary font-bold text-lg rounded-t-xl transition-all duration-300 ease-in-out
              ${
								!isLoginView
									? "bg-surface-bg text-text-primary shadow-inner-top"
									: "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active"
							}`}
						>
							{tUI("auth.register")}
							{!isLoginView && (
								<span className='absolute bottom-0 left-0 w-full h-1 bg-primary-500'></span>
							)}
						</button>
					</div>

					<div className='bg-surface-bg rounded-b-xl shadow-primary-md overflow-hidden border-t border-transparent'>
						{isLoginView ? (
							<Login
								onSwitchToRegister={switchToRegister}
								onSuccess={handleLoginSuccess}
							/>
						) : (
							<Register
								onSwitchToLogin={switchToLogin}
								onClose={handleRegisterSuccess}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthContainer;
