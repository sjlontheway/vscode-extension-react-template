import {
    Direction,
    IDragCanvasListener,
    IDragEventHelper,
    Postion,
} from '../types';

class EventerHandler implements IDragEventHelper {
    private isDraged: boolean = false;
    private isMouseDown: boolean = false;
    private startPosition: Postion | undefined;
    private prePosistion: Postion | undefined;

    private dragListener: IDragCanvasListener | undefined;

    constructor(
        private container: HTMLElement,
        private direction: Direction = 'horizonal',
        private dragThreshold: number = 0
    ) {}

    private _addDragEvent() {
        this.container.addEventListener('mousedown', this._onMouseDown);
        this.container.addEventListener('mousemove', this._onMouseMove);
        this.container.addEventListener('mouseout', this._onMouseOut);
        this.container.addEventListener('mouseup', this._onMouseUp);
    }

    private _removeEvent() {
        this.container.removeEventListener('mousedown', this._onMouseDown);
        this.container.removeEventListener('mousemove', this._onMouseMove);
        this.container.removeEventListener('mouseout', this._onMouseOut);
        this.container.removeEventListener('mouseup', this._onMouseUp);
    }

    private _onMouseDown = (e: MouseEvent) => {
        if (!this.isMouseDown) {
            this.isMouseDown = true;

            if (!this.startPosition) {
                this.startPosition = {
                    x: e.x,
                    y: e.y,
                };
            }
            this.prePosistion = {
                x: e.x,
                y: e.y,
            };
        }
    };

    private _getTranslate() {
        if (this.startPosition && this.prePosistion) {
            return [
                this.prePosistion.x - this.startPosition.x,
                this.prePosistion.y - this.startPosition.y,
            ];
        }
        return [0, 0];
    }

    private _onMouseMove = (e: MouseEvent) => {
        if (this.isMouseDown && this.dragListener && this.prePosistion) {
            const deltaX = e.x - this.prePosistion.x;
            const deltaY = e.y - this.prePosistion.y;
            if (!this.isDraged) {
                this.isDraged = true;
                if (this.dragListener && this.dragListener.onDragStart) {
                    const [translateX, tranlateY] = this._getTranslate();
                    this.dragListener.onDragStart(translateX, tranlateY);
                }
            }
            if (this.isDraged) {
                this.dragListener.onDrag(deltaX, deltaY);
                this.prePosistion.x = e.x;
                this.prePosistion.y = e.y;
            }
        }
    };

    private _onMouseOut = () => {
        this.isDraged = false;
        this.isMouseDown = false;
        if (this.dragListener && this.dragListener.onDragEnd) {
            this.dragListener?.onDragEnd();
        }
    };

    public resetPosition(deltaX: number, deltaY: number) {
        if (this.prePosistion) {
            this.prePosistion.x += deltaX;
            this.prePosistion.y += deltaY;
        }
    }

    public resetStatus() {
        this.prePosistion = undefined;
        this.startPosition = undefined;
        this.isDraged = false;
        this.isMouseDown = false;
    }

    private _onMouseUp = () => {
        this.isMouseDown = false;
        this.isDraged = false;
        if (this.dragListener && this.dragListener.onDragEnd) {
            this.dragListener?.onDragEnd();
        }
    };

    registerDragCanvasEvent(listener: IDragCanvasListener): void {
        this._addDragEvent();
        this.dragListener = listener;
    }

    unregisterDragCanvasEvent(): void {
        this._removeEvent();
        this.isDraged = false;
        this.prePosistion = { x: 0, y: 0 };
        this.startPosition = { x: 0, y: 0 };
        this.dragListener = undefined;
    }
}

export default EventerHandler;
