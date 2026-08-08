"""Small bounded in-memory per-client rate limiter."""

from __future__ import annotations

import math
import time
from collections import defaultdict, deque
from threading import Lock


class InMemoryRateLimiter:
    def __init__(self, window_seconds: int, maximum_keys: int = 10_000) -> None:
        self.window_seconds = window_seconds
        self.maximum_keys = maximum_keys
        self._events: dict[tuple[str, str], deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, client: str, action: str, limit: int) -> tuple[bool, int]:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        key = (client, action)
        with self._lock:
            events = self._events[key]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= limit:
                retry_after = max(1, math.ceil(self.window_seconds - (now - events[0])))
                return False, retry_after
            events.append(now)
            if len(self._events) > self.maximum_keys:
                self._prune(cutoff)
            return True, 0

    def _prune(self, cutoff: float) -> None:
        stale: list[tuple[str, str]] = []
        for key, events in self._events.items():
            while events and events[0] <= cutoff:
                events.popleft()
            if not events:
                stale.append(key)
        for key in stale:
            self._events.pop(key, None)
