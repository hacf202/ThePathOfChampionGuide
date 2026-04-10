/**
 * Maps AWS Cognito error messages/types to localized strings.
 * @param {string} err - The raw error message or code.
 * @param {Function} tUI - The transition function from useTranslation.
 * @returns {string} - The localized error message.
 */
export const mapAuthError = (err, tUI) => {
	if (!err) return tUI("auth.error.general");

	const error = err.toString();

	if (error.includes("NotAuthorizedException"))
		return tUI("auth.error.invalidCredentials");
	
	if (error.includes("UserNotConfirmedException"))
		return tUI("auth.error.notConfirmed");
	
	if (error.includes("UserNotFoundException"))
		return tUI("auth.error.userNotFound");
	
	if (error.includes("PasswordResetRequiredException"))
		return tUI("auth.error.passwordResetRequired");
	
	if (error.includes("LimitExceededException") || error.includes("TooManyRequestsException"))
		return tUI("auth.error.tooManyRequests");
	
	if (error.includes("UsernameExistsException"))
		return tUI("auth.error.accountExists");

	if (error.includes("CodeMismatchException"))
		return tUI("auth.error.codeMismatch");

	if (error.includes("ExpiredCodeException"))
		return tUI("auth.error.expiredCode");

	if (error.includes("InvalidParameterException"))
		return tUI("auth.error.invalidParameter");

	if (error.includes("InternalErrorException"))
		return tUI("auth.error.internalError");

	// If it contains "Lỗi Cognito", it might be a custom text we tossed in apiHelper
	// Let's try to return the raw message if it's already translated or just the general error
	if (error.startsWith("Lỗi Cognito")) {
		return error;
	}

	return err || tUI("auth.error.general");
};
