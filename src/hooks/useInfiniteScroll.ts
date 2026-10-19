import { useEffect, useRef } from "react";

type InfiniteScrollOptions = {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
};

/**
 * Calls `onLoadMore` when the returned sentinel scrolls into view. The
 * observer uses the viewport as root, which still respects the clipping of a
 * scrollable ancestor, so it works both inside an `overflow: auto` container
 * and with plain page scroll.
 */
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
}: InfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) {
      return;
    }
    // Re-created after each load, so a sentinel that is still visible (short
    // pages) asks for the next page right away.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onLoadMoreRef.current();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return sentinelRef;
}
