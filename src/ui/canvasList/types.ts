export interface ICanvasListRender {
  /**
   * 渲染数据
   * @param showingPosition 显示index
   */
  render(showingPosition: number, resetCache: boolean): void;
}

export interface ICanvasListRendererOptions<T> {
  width: number;
  height: number;
  direction: Direction;
  data: T[];
  itemSize: number;
  renderItem(ctx: OffscreenCanvasRenderingContext2D, data: T): void;
}

export interface IDataSource<T> {
  getDataByPosition(position: number): T;

  getRangeDataByIndex(startIndex: number, endIndex: number): Promise<T[]>;

  getDataSize(): number;
}

export type Postion = {
  x: number;
  y: number;
};

export type Direction = "horizonal" | "vertical";

export interface IDragCanvasListener {
  onDragStart?(translateX: number, translateY: number): void;

  onDrag(deltaX: number, deltaY: number): void;

  onDragEnd?(): void;
}

export interface IDragEventHelper {
  registerDragCanvasEvent(listener: IDragCanvasListener): void;
  unregisterDragCanvasEvent(listener: IDragCanvasListener): void;
  resetPosition(deltaX: number, deltaY: number): void;
}

export interface IOffScreenCache<T> {
  updateData(
    data: T[],
    renderItem: (ctx: OffscreenCanvasRenderingContext2D, data: T) => void
  ): void;

  setCacheStartItem(postion: number): void;

  getCache(postion: number): IOffScreenItem | undefined;

  cleanCache(): void;
}

export interface IOffScreenItem {
  getScreenCanvas(): OffscreenCanvas;
}

export interface IOffScreenItemOptions<T> {
  data: T;
  width: number;
  height: number;
  renderItem: (ctx: OffscreenCanvasRenderingContext2D, data: T) => void;
}

export interface IOffScreenCacheOptions<T> {
  width: number;
  height: number;
  cacheSize: number;
  data: T[];
  renderItem: (ctx: OffscreenCanvasRenderingContext2D, data: T) => void;
}
