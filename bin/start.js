#!/usr/bin/env node

import createDebugger from "debug";
import http from "node:http";

import app from "../app.js";
import * as config from "../config.js";
import { setupWebSocketServer } from "../websocket/websocket.js"; // Import the WebSocket setup function

const debug = createDebugger("ArchiOWeb-AdopteUnAnimal:server");

// Get port from environment and store in Express
const port = normalizePort(config.port);
app.set("port", port);

// Create HTTP server
const httpServer = http.createServer(app);

// Create WebSocket server
setupWebSocketServer(httpServer); // Setup WebSocket server

// Listen on provided port, on all network interfaces
httpServer.listen(port);
httpServer.on("error", onHttpServerError);
httpServer.on("listening", onHttpServerListening);

// Normalize a port into a number, string, or false
function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

function onHttpServerError(error) {
	if (error.syscall !== "listen") {
		throw error;
	}

	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

	// Handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
		case "EADDRINUSE":
			console.error(`${bind} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
}

function onHttpServerListening() {
	const addr = httpServer.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	debug(`Listening on ${bind}`);
}
