import { WebSocketServer } from "ws";
import { addMessageToAdoption } from "./utils/adoptionUtils.js"; // Import the utility function
import { authenticateWebSocket } from "./middleware/auth.js";

const clients = new Map();

export function setupWebSocketServer(httpServer) {
	const wss = new WebSocketServer({ server: httpServer });

	wss.on("connection", (ws, req) => {
		console.log("New client connected");

		ws.on("message", async (data) => {
			const parsedData = JSON.parse(data);
			if (parsedData.type === "authenticate") {
				await authenticateWebSocket(ws, parsedData.token);
				clients.set(ws, { userId: ws.currentUserId, adoptionId: parsedData.adoptionId });
				return;
			}

			// Check if the client is authenticated
			if (!clients.has(ws)) {
				ws.close(1008, "You must authenticate first");
				return;
			}

			const { adoptionId, message } = parsedData;
			addMessageToAdoption(adoptionId, message)
				.then((updatedMessages) => {
					const userIds = updatedMessages.userIds;
					wss.clients.forEach((client) => {
						const clientInfo = clients.get(client);
						if (
							client.readyState === WebSocket.OPEN &&
							userIds.includes(clientInfo.userId.toString()) &&
							clientInfo.adoptionId === adoptionId
						) {
							client.send(JSON.stringify(message));
						}
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
}
