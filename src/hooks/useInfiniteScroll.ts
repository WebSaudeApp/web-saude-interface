import { useCallback, useEffect, useRef, useState } from "react";

// Simulated latency for each extra batch, so the "carregando" state is
// visible while there is no backend behind the list yet.
const LOAD_DELAY_MS = 400;

/**
 * Reveals `items` in batches of `batchSize` as a sentinel element scrolls
 * into view. The observer uses the viewport as root, which still respects
 * the clipping of a scrollable ancestor, so it works both inside an
 * `overflow: auto` container and with plain page scroll.
 */
export function useInfiniteScroll<T>(items: T[], batchSize: number) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = visibleCount < items.length;

  useEffect(() => {
    setVisibleCount(batchSize);
    setLoading(false);
  }, [items, batchSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setLoading(true);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, visibleCount]);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => count + batchSize);
      setLoading(false);
    }, LOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [loading, batchSize]);

  const ensureVisible = useCallback(
    (index: number) => {
      setVisibleCount((count) =>
        index < count ? count : Math.ceil((index + 1) / batchSize) * batchSize,
      );
    },
    [batchSize],
  );

  return {
    visible: items.slice(0, visibleCount),
    hasMore,
    loading,
    sentinelRef,
    ensureVisible,
  };
}
