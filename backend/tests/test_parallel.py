import pytest
from pysrc.utils.parallel import ParallelTaskManager
import asyncio

async def dummy_task(delay: float, return_value: str) -> str:
    await asyncio.sleep(delay)
    return return_value

@pytest.mark.asyncio 
async def test_parallel_task_manager_basic():
    manager = ParallelTaskManager[str](max_concurrent_tasks=2)
    
    # Test initial state
    assert manager.get_pending_tasks_count() == 0
    
    # Submit tasks
    await manager.submit_task(dummy_task, 0.1, "task1")
    await manager.submit_task(dummy_task, 0.1, "task2")
    
    # Check pending tasks count
    assert manager.get_pending_tasks_count() == 2
    
    # Wait for completion and check results
    results = await manager.wait_all()
    assert len(results) == 2
    assert set(results) == {"task1", "task2"}
    
    # Verify tasks are cleared after completion
    assert manager.get_pending_tasks_count() == 0

@pytest.mark.asyncio
async def test_parallel_task_manager_concurrent_execution():
    manager = ParallelTaskManager[str](max_concurrent_tasks=2)
    
    start_time = asyncio.get_event_loop().time()
    
    # Submit 4 tasks that each take 0.1 seconds
    await manager.submit_task(dummy_task, 0.1, "task1")
    await manager.submit_task(dummy_task, 0.1, "task2")
    await manager.submit_task(dummy_task, 0.1, "task3")
    await manager.submit_task(dummy_task, 0.1, "task4")
    
    results = await manager.wait_all()
    
    end_time = asyncio.get_event_loop().time()
    execution_time = end_time - start_time
    
    # With max_concurrent_tasks=2, should take ~0.2 seconds
    # Adding small buffer for execution overhead
    assert execution_time < 0.3
    assert len(results) == 4
    assert set(results) == {"task1", "task2", "task3", "task4"}

@pytest.mark.asyncio
async def test_parallel_task_manager_empty_wait():
    manager = ParallelTaskManager[str](max_concurrent_tasks=2)
    results = await manager.wait_all()
    assert results == []

@pytest.mark.asyncio
async def test_parallel_task_manager_different_durations():
    manager = ParallelTaskManager[str](max_concurrent_tasks=3)
    
    await manager.submit_task(dummy_task, 0.2, "slow")
    await manager.submit_task(dummy_task, 0.1, "fast")
    
    results = await manager.wait_all()
    assert len(results) == 2
    assert set(results) == {"slow", "fast"}