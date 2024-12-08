import time
import psutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class HealthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"

    async def get_basic_health(self):
        """Basic health check"""
        db_status = await self._check_database()
        system_status = self._check_system_resources()
        
        overall_status = "healthy"
        if db_status["status"] != "healthy" or system_status["status"] != "healthy":
            overall_status = "unhealthy"
        
        return {
            "status": overall_status,
            "components": {
                "database": db_status["status"],
                "system": system_status["status"]
            },
            "version": self._version,
            "uptime_seconds": time.time() - self._start_time
        }

    async def get_detailed_health(self):
        """Detailed health check"""
        db_status = await self._check_database()
        system_status = self._check_system_resources()
        
        return {
            "status": "healthy" if db_status["status"] == "healthy" and system_status["status"] == "healthy" else "unhealthy",
            "version": self._version,
            "uptime_seconds": time.time() - self._start_time,
            "components": [
                {
                    "name": "database",
                    "status": db_status["status"],
                    "details": {"message": db_status["message"]}
                },
                {
                    "name": "system",
                    "status": system_status["status"],
                    "details": {
                        "cpu_usage": f"{system_status['cpu_percent']}%",
                        "memory_usage": f"{system_status['memory_percent']}%"
                    }
                }
            ]
        }

    async def _check_database(self):
        """Check database connectivity"""
        try:
            query = text("SELECT 1")
            await self.session.execute(query)
            await self.session.commit()
            return {
                "status": "healthy",
                "message": "Database connection successful"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(e)}"
            }

    def _check_system_resources(self):
        """Check system resources"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()

        status = "healthy"
        if cpu_percent > 90 or memory.percent > 90:
            status = "unhealthy"
        elif cpu_percent > 70 or memory.percent > 70:
            status = "degraded"

        return {
            "status": status,
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent
        }