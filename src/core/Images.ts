/**
 * Lazy image cache: rooms load their backgrounds on demand (current room + neighbors are prefetched),
 * so adding rooms does not grow the startup preload list.
 */
export class ImageCache {
  private images = new Map<string, HTMLImageElement>();
  private pending = new Map<string, Promise<void>>();

  /** Returns the image if loaded; otherwise starts loading it and returns undefined. */
  public get(url: string | undefined): HTMLImageElement | undefined {
    if (!url) return undefined;
    const img = this.images.get(url);
    if (!img) void this.load(url);
    return img;
  }

  public load(url: string): Promise<void> {
    if (this.images.has(url)) return Promise.resolve();
    const existing = this.pending.get(url);
    if (existing) return existing;

    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(url, img);
        this.pending.delete(url);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Could not load asset: ${url}, fallback will be used`);
        resolve(); // keep pending so a missing asset is not re-requested every frame
      };
      img.src = url;
    });
    this.pending.set(url, promise);
    return promise;
  }

  public loadAll(urls: (string | undefined)[]): Promise<void> {
    return Promise.all(urls.filter((u): u is string => !!u).map((u) => this.load(u))).then(() => undefined);
  }
}
