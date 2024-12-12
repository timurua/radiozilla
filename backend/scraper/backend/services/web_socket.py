# backend/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Set, Callable
import asyncio
from datetime import datetime

class Connection:
    def __init__(self, websocket: WebSocket, on_deleted: Callable | None = None) -> None:
        self.websocket = websocket
        self.last_heartbeat = datetime.now()
        self.on_deleted = on_deleted

    def update_heartbeat(self):
        self.last_heartbeat = datetime.now()

    

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[WebSocket, Connection] = {}
        self.heartbeat_interval = 30  # seconds

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        connection = Connection(websocket)
        self.active_connections[websocket] = connection

    async def disconnect(self, websocket: WebSocket):
        connection = self.active_connections.get(websocket)
        del self.active_connections[websocket]
        if connection and connection.on_deleted:
            await connection.on_deleted()
        

    async def broadcast(self, message: str):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)

        # Remove disconnected clients
        for connection in disconnected:
            await self.disconnect(connection)

manager = ConnectionManager()

def get_connection_manager() -> ConnectionManager:
    return manager
