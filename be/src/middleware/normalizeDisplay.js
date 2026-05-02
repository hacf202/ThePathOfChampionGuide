import { prepareDisplayForSave } from "../utils/dbHelpers.js";

export const normalizeDisplayMiddleware = (req, res, next) => {
	if (req.body.display !== undefined) {
		req.body.display = prepareDisplayForSave(req.body.display);
	}
	next();
};
