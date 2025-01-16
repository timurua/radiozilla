# backend/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Set, Callable
from datetime import datetime
import logging

logger = logging.getLogger("web_socket_connection")

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()
        self.heartbeat_interval = 30  # seconds

    async def connect(self, websocket: WebSocket):
        logger.info("WebSocket connected")
        await websocket.accept()
        self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        logger.info("WebSocket connected")
        try:
            await websocket.close()
        except Exception as e:
            logger.error(f"Error closing websocket connection: {e}", exc_info=True)
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = set()
        if len(self.active_connections) == 0:
            logger.info("WebSocket skipping broadcast, no active connections")
            return
        for connection in self.active_connections:
            try:
                logger.info(f"WebSocket sending message to connection: {connection}")
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"WebSocket error broadcasting message to connection: {connection}, exception {e}", exc_info=True)
                disconnected.add(connection)

        # Remove disconnected clients
        for connection in disconnected:
            logger.info(f"WebSocket Disconnecting connection: {connection}")
            await self.disconnect(connection)

manager = ConnectionManager()

def get_connection_manager() -> ConnectionManager:
    return manager
