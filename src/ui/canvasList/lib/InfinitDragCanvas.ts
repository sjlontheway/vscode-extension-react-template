import { MicroSimScreenData } from "../../microsimLayout/MicroSim";
import {
  ICanvasListRender,
  ICanvasListRendererOptions,
  IDragCanvasListener,
  IOffScreenCache,
} from "../types";

import OffScreenItemCache, { ScreenItem } from "./drawCache";
import EventerHandler from "./EventHandler";

class CanvasListRenderer<T> implements ICanvasListRender, IDragCanvasListener {
  private canvas: HTMLCanvasElement;

  private translateLen: number = 0;

  private eventHandler: EventerHandler;

  private renderScreenIndexList: number[] = [];

  private updatingThreshold = 0.5;

  private updatingThresholdLen = 0;

  private currentShowItemIndex = -1;

  private drawCache: IOffScreenCache<T>;
  constructor(
    private container: HTMLDivElement,
    private options: ICanvasListRendererOptions<T>
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.container.appendChild(this.canvas);
    this.eventHandler = new EventerHandler(this.canvas);
    this.eventHandler.registerDragCanvasEvent(this);
    this.updatingThresholdLen =
      this.options.direction === "horizonal"
        ? this.options.width * this.updatingThreshold
        : this.options.height * this.updatingThreshold;
    const { width, height, renderItem, data } = this.options;
    this.drawCache = new OffScreenItemCache({
      width,
      height,
      data,
      renderItem,
      cacheSize: 3,
    });
  }

  private _getBaseScreenSize(): number {
    return this.options.direction === "horizonal"
      ? this.options.width
      : this.options.height;
  }

  private _generatorRenderScreens(
    showingScreenIndex: number,
    updateTranslate: boolean
  ) {
    const baseSize = this._getBaseScreenSize();
    let baseTranslate = 0;
    if (showingScreenIndex <= 0) {
      this.renderScreenIndexList = [0, 1, 2];
      if (updateTranslate) this.translateLen = 0;
    } else if (showingScreenIndex === this.options.itemSize - 1) {
      this.renderScreenIndexList = [
        showingScreenIndex - 2,
        showingScreenIndex - 1,
        showingScreenIndex,
      ];
      baseTranslate = -2 * baseSize;
    } else {
      this.renderScreenIndexList = [
        showingScreenIndex - 1,
        showingScreenIndex,
        showingScreenIndex + 1,
      ];
      baseTranslate = -baseSize;
    }

    if (updateTranslate) this.translateLen = baseTranslate;
  }

  public resetData(
    data: T[],
    renderItem: (ctx: OffscreenCanvasRenderingContext2D, data: T) => void
  ) {
    this.options.data = data;
    this.options.renderItem = renderItem;
    this.options.itemSize = data.length;
    this.drawCache.updateData(data, renderItem);
    this.currentShowItemIndex = -1;
    this.translateLen = 0;
  }

  public render(showingItemIndex: number = 0) {
    this._render(showingItemIndex, true);
  }

  private _render(
    showingItemIndex: number,
    updateTranslate: boolean = false
  ): void {
    if (this.currentShowItemIndex !== showingItemIndex) {
      this.currentShowItemIndex = showingItemIndex;
      this._generatorRenderScreens(showingItemIndex, updateTranslate);
      this.drawCache.setCacheStartItem(this.renderScreenIndexList[0]);
    }

    this._drawOffScreenItem();
  }

  private _isVerticalLayout() {
    return this.options.direction === "vertical";
  }

  private _isReachMinBound() {
    return this.renderScreenIndexList[0] === 0;
  }

  private _isReachMaxBound() {
    return (
      this.renderScreenIndexList[this.renderScreenIndexList.length - 1] ===
      this.options.itemSize - 1
    );
  }

  onDrag(deltaX: number, deltaY: number): void {
    const { width, height, direction } = this.options;
    let baseSize = width;
    let deltaSize = deltaX;
    if (direction === "vertical") {
      baseSize = height;
      deltaSize = deltaY;
    }

    this.translateLen = this.translateLen + deltaSize;
    let resetPostion = this.currentShowItemIndex;

    // 到达小索引边界，且继续像小边界滑动
    if (this._isReachMinBound() && deltaSize > 0) {
      this.translateLen = Math.min(0, this.translateLen);
    } else if (this._isReachMaxBound() && deltaSize < 0) {
      // 到达大索引方向边界，且继续滑动时
      this.translateLen = Math.max(-baseSize, this.translateLen);
    } else {
      // 往小索引滚动且触发更新前一屏幕内容
      if (deltaSize > 0 && this.translateLen >= -this.updatingThresholdLen) {
        this.translateLen -= baseSize;
        resetPostion--;
      } else if (
        // 往大索引滚动且触发更新前一屏幕内容
        deltaSize < 0
      ) {
        if (
          this.currentShowItemIndex === 0 &&
          this.translateLen <= -this.updatingThresholdLen
        ) {
          resetPostion++;
          this.translateLen -= baseSize;
        } else if (this.translateLen <= -baseSize - this.updatingThresholdLen) {
          this.translateLen += baseSize;
          resetPostion++;
        }
      }
    }

    this._render(resetPostion);
  }

  private _drawOffScreenItem() {
    const ctx = this.canvas.getContext("2d");
    ctx?.clearRect(0, 0, this.options.width, this.options.height);
    ctx?.save();
    let tranlateX = this.translateLen;
    let tranlateY = 0;
    if (this._isVerticalLayout()) {
      tranlateX = 0;
      tranlateY = this.translateLen;
    }

    ctx?.translate(tranlateX, tranlateY);
    const width = this.options.width;
    let i = 0;
    for (let position of this.renderScreenIndexList) {
      const offScreenItem = this.drawCache.getCache(position);
      if (offScreenItem)
        ctx?.drawImage(offScreenItem.getScreenCanvas(), i * width, 0);
      i++;
    }
    ctx?.restore();
  }
}

export default CanvasListRenderer;
