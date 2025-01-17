import jwt from "jsonwebtoken";
import { promisify } from "util";
import { secret } from "../config.js";

const verifyJwt = promisify(jwt.verify);

export async function authenticateWebSocket(ws, token) {
	try {
		const payload = await verifyJwt(token, secret);
		ws.currentUserId = payload.sub;
	} catch (err) {
		ws.close(1008, "Your token is invalid or has expired");
	}
}
