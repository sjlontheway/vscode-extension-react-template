import {
  IOffScreenCache,
  IOffScreenCacheOptions,
  IOffScreenItem,
  IOffScreenItemOptions,
} from "../types";

export class ScreenItem<T> implements IOffScreenItem {
  private offScreenCanvase: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D | null;
  constructor(private options: IOffScreenItemOptions<T>) {
    this.offScreenCanvase = new OffscreenCanvas(
      this.options.width,
      this.options.height
    );
    this.ctx = this.offScreenCanvase.getContext("2d");
    if (!this.ctx) {
      throw new Error("Not support OffScreenCanvas!");
    }
    this.options.renderItem(this.ctx, this.options.data);
  }

  public getScreenCanvas() {
    return this.offScreenCanvase;
  }
}

class OffScreenItemCache<T> implements IOffScreenCache<T> {
  private startItemPosition: number = -1;
  private cacheMap = new Map<number, ScreenItem<T>>();

  constructor(private options: IOffScreenCacheOptions<T>) {}

  updateData(
    data: T[],
    renderItem: (ctx: OffscreenCanvasRenderingContext2D, data: T) => void
  ): void {
    this.options.data = data;
    this.options.renderItem = renderItem;
    this.cleanCache();
  }

  cleanCache(): void {
    this.cacheMap.clear();
    this.startItemPosition = -1;
  }

  setCacheStartItem(startPostion: number): void {
    if (startPostion >= 0 && startPostion === this.startItemPosition) {
      return;
    }

    const { cacheSize, width, height, data, renderItem } = this.options;

    const newMap = new Map();
    for (let i = startPostion; i < startPostion + cacheSize; i++) {
      const itemData = data[i];
      let screen = this.cacheMap.get(i);
      if (!screen) {
        screen = new ScreenItem({
          width,
          height,
          data: itemData,
          renderItem,
        });
      }

      newMap.set(i, screen);
    }
    this.cacheMap = newMap;
  }

  getCache(position: number): ScreenItem<T> | undefined {
    return this.cacheMap.get(position);
  }
}

export default OffScreenItemCache;
