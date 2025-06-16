// web/src/lib/utils/virtual-scroll.js
export function createVirtualScroller(options) {
    const {
        items,
        itemHeight,
        containerHeight,
        buffer = 5
    } = options;

    let scrollTop = $state(0);
    let visibleStart = $derived(Math.floor(scrollTop / itemHeight));
    let visibleEnd = $derived(Math.ceil((scrollTop + containerHeight) / itemHeight));
    let displayStart = $derived(Math.max(0, visibleStart - buffer));
    let displayEnd = $derived(Math.min(items.length, visibleEnd + buffer));
    let offsetY = $derived(displayStart * itemHeight);

    return {
        visibleItems: $derived(items.slice(displayStart, displayEnd)),
        totalHeight: items.length * itemHeight,
        offsetY,
        updateScroll(newScrollTop) {
            scrollTop = newScrollTop;
        }
    };
}