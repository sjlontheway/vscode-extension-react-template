import React, { useEffect, useRef, useState } from "react";
import CanvasRenderer from "./lib/InfinitDragCanvas";
import { ICanvasListRendererOptions } from "./types";

export type CanvasListProps<T> = ICanvasListRendererOptions<T> & {
  screenIndex: number;
};

const CanvasList = <T,>(props: CanvasListProps<T>) => {
  console.log("render CanvasList:", props);
  const { width, height, direction, itemSize, data, screenIndex, renderItem } =
    props;
  const ref = useRef(null);
  const [canvas, setCanvas] = useState<CanvasRenderer<T>>();

  useEffect(() => {
    if (!canvas) {
      const container = ref.current;

      if (container) {
        const newCanvas = new CanvasRenderer<T>(container, {
          width,
          height,
          direction,
          data,
          itemSize,
          renderItem: renderItem,
        });
        newCanvas.render(screenIndex);
        setCanvas(newCanvas);
      }
    } else {
      canvas.resetData(data,renderItem);
      canvas.render(screenIndex);
    }
  }, [screenIndex, data]);

  return (
    <div
      style={{ width, height, overflow: "hidden", backgroundColor: "bisque" }}
      className="canvas-container"
      ref={ref}
    ></div>
  );
};

export default CanvasList;
