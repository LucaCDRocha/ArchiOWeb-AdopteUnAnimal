#!/usr/bin/env node

import createDebugger from "debug";
import http from "node:http";
import { WebSocketServer } from "ws";

import app from "../app.js";
import * as config from "../config.js";
import Adoption from "../models/adoption.js";

const debug = createDebugger("ArchiOWeb-AdopteUnAnimal:server");

// Get port from environment and store in Express
const port = normalizePort(config.port);
app.set("port", port);

// Create HTTP server
const httpServer = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer });

const clients = new Map();

wss.on("connection", (ws, req) => {
	console.log("New client connected");

	ws.on("message", (data) => {
		const parsedData = JSON.parse(data);
		if (parsedData.type === "authenticate") {
			clients.set(ws, { userId: parsedData.userId, adoptionId: parsedData.adoptionId });
			return;
		}

		const { adoptionId, message } = parsedData;
		Adoption.findById(adoptionId)
			.populate("pet_id")
			.exec()
			.then((adoption) => {
				if (!adoption) {
					return;
				}
				adoption.messages.push(message);
				return adoption.save().then((updatedAdoption) => {
					const userIds = [adoption.user_id.toString(), adoption.pet_id.spa_id.toString()];
					wss.clients.forEach((client) => {
						const clientInfo = clients.get(client);
						if (client.readyState === WebSocket.OPEN && userIds.includes(clientInfo.userId) && clientInfo.adoptionId === adoptionId) {
							client.send(JSON.stringify(message));
						}
					});
				});
			})
			.catch((err) => {
				console.error(err);
			});
	});

	ws.on("close", () => {
		console.log("Client disconnected");
		clients.delete(ws);
	});
});

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
