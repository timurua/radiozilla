import asyncio
from typing import Callable, List, Any, Coroutine, TypeVar, Generic, Deque

T = TypeVar('T')  # Define a generic type variable

class ParallelTaskManager(Generic[T]):
    def __init__(self, max_concurrent_tasks: int = 5) -> None:
        self.semaphore: asyncio.Semaphore = asyncio.Semaphore(max_concurrent_tasks)
        self.tasks: Deque[asyncio.Task[T]] = deque()
    
    async def submit_task(
        self, 
        task_func: Callable[..., Coroutine[Any, Any, T]], 
        *args: Any, 
        **kwargs: Any
    ) -> None:
        """
        Submit a task to be executed with semaphore control
        """
        async def _wrapped_task() -> T:
            async with self.semaphore:
                return await task_func(*args, **kwargs)
        
        task: asyncio.Task[T] = asyncio.create_task(_wrapped_task())
        self.tasks.append(task)
    
    async def wait_all(self) -> List[T]:
        """
        Wait for all submitted tasks to complete and return their results
        """
        if not self.tasks:
            return []
        
        # Wait for all tasks to complete
        completed_tasks: List[T] = await asyncio.gather(*self.tasks)
        
        # Clear the task queue
        self.tasks.clear()
        
        return completed_tasks

    def get_pending_tasks_count(self) -> int:
        """
        Return the number of pending tasks
        """
        return len(self.tasks)