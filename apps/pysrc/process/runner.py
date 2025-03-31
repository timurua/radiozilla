import asyncio
import logging
import subprocess
from typing import List, Optional

class ProcessRunnerException(Exception):
    pass

class ProcessRunner:
    def __init__(self, command: List[str], timeout_minutes: int, cwd: Optional[str] = None):
        self.command = command
        self.timeout_minutes = timeout_minutes * 60  # Convert minutes to seconds
        self.cwd = cwd
        self.logger = logging.getLogger(__name__)

    async def run(self) -> bool:
        self.logger.info(f"Starting process with command: {' '.join(self.command)} with timeout {self.timeout_minutes} minutes")
        try:
            process = await asyncio.create_subprocess_exec(
                *self.command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.cwd
            )

            try:
                async def read_stream(stream, is_error=False):
                    while True:
                        line = await stream.readline()
                        if not line:
                            break
                        line_str = line.decode().strip()
                        if is_error:
                            self.logger.error(f"Process stderr: {line_str}")
                        else:
                            self.logger.info(f"Process stdout: {line_str}")

                await asyncio.wait_for(
                    asyncio.gather(
                        read_stream(process.stdout),
                        read_stream(process.stderr, True)
                    ),
                    timeout=self.timeout_minutes * 60
                )

                await process.wait()
                return process.returncode == 0

            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                self.logger.error(f"Process timed out after {self.timeout_minutes} seconds")
                return False

        except Exception as e:
            self.logger.error(f"An error occurred: {e}")
            raise ProcessRunnerException(f"An error occurred: {e}") from e