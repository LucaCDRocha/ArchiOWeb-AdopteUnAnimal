import { WebSocketServer } from "ws";
import { addMessageToAdoption } from "./utils/adoptionUtils.js"; // Import the utility function

const clients = new Map();

export function setupWebSocketServer(httpServer) {
	const wss = new WebSocketServer({ server: httpServer });

	wss.on("connection", (ws, req) => {
		console.log("New client connected");

		ws.on("message", (data) => {
			const parsedData = JSON.parse(data);
			if (parsedData.type === "authenticate") {
				clients.set(ws, { userId: parsedData.userId, adoptionId: parsedData.adoptionId });
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
