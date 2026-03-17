// src/middleware/normalizeDisplay.js
import { normalizeDisplayForSave } from "../utils/dynamodb.js";

export const normalizeDisplayMiddleware = (req, res, next) => {
	if (req.body.display !== undefined) {
		req.body.display = normalizeDisplayForSave(req.body.display);
	}
	next();
};
