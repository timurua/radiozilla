import asyncio
from typing import Any, Callable, TypeVar, Awaitable, Coroutine
import concurrent.futures

# Define a generic type for the return value of the function
T = TypeVar('T')

# This is our helper function that takes another function as a parameter
async def run_task_with_new_executor(func: Callable[..., T], *args: Any) -> T:
    # Get the event loop
    loop = asyncio.get_event_loop()
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
    # Create a thread pool executor
        # Run the passed function in the executor
        # This allows CPU-bound tasks to run without blocking the event loop
        result = await loop.run_in_executor(executor, func, *args)
        
    return result

async def run_async_in_executor(coro_func: Callable[..., Coroutine[Any, Any, T]], *args: Any, **kwargs: Any) -> [T]:
    """
    Run a coroutine in a ThreadPoolExecutor and return an awaitable.
    This allows the function to be used in both sync and async contexts.
    """
    loop = asyncio.get_running_loop()
    
    async def wrapper() -> T:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return await loop.run_in_executor(
                pool,
                lambda: asyncio.run(coro_func(*args, **kwargs))
            )
    
    # Create a task for the wrapper coroutine
    return await wrapper()