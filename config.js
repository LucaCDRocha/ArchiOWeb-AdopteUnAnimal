import * as dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT ?? 3000;
export const bcryptCostFactor = 10;
export const secret = process.env.SECRET;
export const databaseUrl = process.env.DATABASE_URL ?? "mongodb://localhost/ArchiOWeb-AdopteUnAnimal";
export const corsOrigin = process.env.CORS_ORIGIN;

if (!corsOrigin) {
	throw new Error("Environment variable $CORS_ORIGIN must be defined");
}
if (!secret) {
	throw new Error("Environment variable $SECRET must be defined");
}

// Validate that port is a positive integer.
if (process.env.PORT) {
	const parsedPort = parseInt(process.env.PORT, 10);
	if (!Number.isInteger(parsedPort)) {
		throw new Error("Environment variable $PORT must be an integer");
	} else if (parsedPort < 1 || parsedPort > 65535) {
		throw new Error("Environment variable $PORT must be a valid port number");
	}
}
