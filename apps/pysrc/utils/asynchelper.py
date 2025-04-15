import asyncio
import concurrent.futures
import time
from typing import Any, Callable, TypeVar, Awaitable

# Define a generic type for the return value of the function
T = TypeVar('T')

# This is our helper function that takes another function as a parameter
async def run_task_with_new_executor(func: Callable[..., T], *args: Any) -> T:
    # Get the event loop
    loop = asyncio.get_event_loop()
    
    # Create a thread pool executor
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Run the passed function in the executor
        # This allows CPU-bound tasks to run without blocking the event loop
        result = await loop.run_in_executor(executor, func, *args)
        
    return result