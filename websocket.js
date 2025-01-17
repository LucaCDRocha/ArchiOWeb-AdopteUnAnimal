import { WebSocketServer } from "ws";
import { addMessageToAdoption } from "./utils/adoptionUtils.js"; // Import the utility function
import { authenticateWebSocket } from "./middleware/auth.js";

let wss;

export function setupWebSocketServer(httpServer) {
	wss = new WebSocketServer({ server: httpServer });

	wss.on("connection", (ws, req) => {
		console.log("New client connected");

		ws.on("message", async (data) => {
			const parsedData = JSON.parse(data);
			if (parsedData.type === "authenticate") {
				await authenticateWebSocket(ws, parsedData.token);
				ws.userId = ws.currentUserId;
				ws.adoptionId = parsedData.adoptionId;
				console.log("Client authenticated:", ws.userId);
				return;
			}
		});

		ws.on("close", () => {
			console.log("Client disconnected");
		});
	});
}

export function wsSend(type, adoptionId, data) {
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN && client.adoptionId.toString() === adoptionId.toString()) {
			client.send(JSON.stringify({ type, data }));
		}
	});
}
