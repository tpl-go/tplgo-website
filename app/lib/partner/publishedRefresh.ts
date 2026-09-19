/** Refresh public configuration without rehydrating application forms. */
export type PublishedVersions = { catalogue: number; content: number; policy: number };
export function acceptsPublishedVersions(previous: PublishedVersions | null, next: PublishedVersions): boolean {
  return ["catalogue", "content", "policy"].every((key) => {
    const field = key as keyof PublishedVersions;
    return Number.isSafeInteger(next[field]) && next[field] >= 0 && (!previous || next[field] >= previous[field]);
  });
}

export function watchVisiblePublication(refresh: () => Promise<void>, interval = 30_000) {
  let disposed = false, running = false;
  const run = async () => {
    if (disposed || running || document.visibilityState === "hidden") return;
    running = true;
    try { await refresh(); } finally { running = false; }
  };
  const wake = () => { void run(); };
  const start = window.setTimeout(wake, 0);
  const timer = window.setInterval(wake, interval);
  window.addEventListener("focus", wake);
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("tpl:refresh-partner-configuration", wake);
  return () => {
    disposed = true;
    clearTimeout(start); clearInterval(timer);
    window.removeEventListener("focus", wake);
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("tpl:refresh-partner-configuration", wake);
  };
}
