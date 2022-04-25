import React, { CSSProperties, FC } from "react";
import CanvasList from "../canvasList/CavasList";
import { IDataSource } from "../canvasList/types";
import { autoNewlineDrawText } from "../utils/textUtils";
import "./MicroSim.css";

export interface ILeftUnitProps {
  items: string[];
  itemWidth: number;
  itemHeight: number;
  containerStyle?: CSSProperties | undefined;
}

export const items = [
  "predict_unit",
  "table_walker",
  "icache_l1",
  "icache_l2",
  "mmu_unit",
  "dram_unit",
  "fetch_unit",
];

export type FieldName =
  | "predict_unit"
  | "table_walker"
  | "icache_l1"
  | "icache_l2"
  | "mmu_unit"
  | "dram_unit"
  | "fetch_unit";

export interface MircoSimItem {
  unit: FieldName;
  description: string;
}

export type MircoCycleData = {
  cycleIndex: number;
  excutedTasks: MircoSimItem[];
};

export type MicroSimScreenData = MircoCycleData[];

export interface FilterCondition {
  search?: string;
  units?: string[];
}

const LeftUnitLayout: FC<ILeftUnitProps> = (props: ILeftUnitProps) => {
  const { items, itemWidth, itemHeight, containerStyle } = props;

  const children = items.map((item) => {
    return (
      <div
        key={`${item}`}
        className="unit-item"
        style={{
          height: itemHeight,
          lineHeight: `${itemHeight}px`,
        }}
      >
        {item}
      </div>
    );
  });
  return <div style={containerStyle}>{children}</div>;
};

export interface IMicroSimProps<MircoCycleData> {
  data: MircoCycleData[];
  canvasWidth: number;
  canvasHeight: number;
  leftBarWidth: number;
  itemSize: number;
  screenIndex: number;
  leftUnits: string[];
  theme?: "dark" | "light";
}

function MicroSimLayout(props: IMicroSimProps<MicroSimScreenData>) {
  const {
    data,
    canvasWidth,
    canvasHeight,
    leftUnits,
    leftBarWidth,
    screenIndex,
    itemSize,
  } = props;
  const padding = 12;
  const fontSize = 10;
  const anchorLen = 5;
  const textPadding = 5;
  console.log("renderMicroSimLayout:", props);

  const itemHeight = Math.ceil(
    (canvasHeight - 2 * padding - anchorLen - textPadding * 2 - fontSize) /
      leftUnits.length
  );

  const drawCoordinatehorizonal = (
    ctx: OffscreenCanvasRenderingContext2D,
    data: MicroSimScreenData,
    itemSize: number,
    itemHeight: number,
    padding: number
  ) => {
    const { width, height } = ctx.canvas;
    // draw coordinate X
    ctx.save();
    ctx.strokeStyle = "black";
    const coorHPositionY = height - padding - fontSize - textPadding * 2;
    ctx.beginPath();
    ctx.moveTo(0, coorHPositionY);
    ctx.lineTo(width, coorHPositionY);
    ctx.stroke();

    ctx.font = `${fontSize}px`;
    const anchorStartY = coorHPositionY - anchorLen;
    const anchorEndY = anchorStartY + anchorLen;

    const size = data.length;
    const xAnchorDuration = width / size;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#f5f5f5";
    const itemHeightWidthBorder = itemHeight + 1;
    for (let i = 0; i < itemSize - 1; i++) {
      const height = itemHeightWidthBorder + itemHeightWidthBorder * i + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();
    }
    ctx.restore();

    let anchorX = 0;
    for (let i = 0; i < size; i++) {
      anchorX = i * xAnchorDuration;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorStartY);
      ctx.lineTo(anchorX, anchorEndY);
      ctx.stroke();

      const currentCycle = `${data[i].cycleIndex}`;
      ctx.textBaseline = "top";
      ctx.fillText(
        currentCycle,
        anchorX + textPadding,
        coorHPositionY + textPadding
      );
    }
    ctx.restore();
  };

  const drawTask = (
    ctx: OffscreenCanvasRenderingContext2D,
    startX: number,
    startY: number,
    cycleWidth: number,
    cycleHeight: number,
    task: MircoSimItem
  ) => {
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    const centerX = startX + cycleWidth / 2;
    const centerY = startY + cycleHeight / 2;
    const scale = 0.7;
    const taskWidth = cycleWidth * scale;
    const taskHeight = cycleHeight * scale;
    const borderStartX = centerX - taskWidth / 2;
    const borderStartY = centerY - taskHeight / 2;
    ctx.strokeRect(borderStartX, borderStartY, taskWidth, taskHeight);
    ctx.restore();

    const textStartX = borderStartX + 5;
    const textStartY = borderStartY + 5;

    const fontSize = 10;
    const lineHeight = 10;
    const textWidth = taskWidth - 10;
    const textHeight = taskHeight - 10;
    const maxLines = Math.floor(textHeight / lineHeight);

    autoNewlineDrawText(ctx, task.description, {
      startX: textStartX,
      startY: textStartY,
      fontSize,
      maxLines,
      lineHeight,
      lineWidth: textWidth,
      autoEllipsis: true,
      fontColor: "#333",
    });
  };

  const renderScreenData = (
    ctx: OffscreenCanvasRenderingContext2D,
    units: string[],
    data: MicroSimScreenData,
    cycleSizePerScreen: number,
    options = {
      coordingAnchorLen: 5,
      fontSize: 10,
      padding: 12,
      fontPadding: 5,
    }
  ) => {
    const { width, height } = ctx.canvas;
    const { coordingAnchorLen, fontSize, fontPadding, padding } = options;

    const cycleWidth = width / cycleSizePerScreen;
    const taskHeight = Math.ceil(
      (height - padding - coordingAnchorLen - fontSize - fontPadding) /
        units.length
    );

    drawCoordinatehorizonal(ctx, data, units.length, itemHeight, padding);

    for (let i = 0; i < data.length; i++) {
      const { excutedTasks } = data[i];
      const startX = i * cycleWidth;
      for (let task of excutedTasks) {
        const index = units.findIndex((x) => x === task.unit);
        const startY = index * taskHeight;
        drawTask(ctx, startX, startY, cycleWidth, taskHeight, task);
      }
    }
  };

  const renderItem = (
    ctx: OffscreenCanvasRenderingContext2D,
    data: MicroSimScreenData
  ) => {
    console.log(data)
    renderScreenData(ctx, leftUnits, data, data.length);
  };

  return (
    <div className="microsim-container">
      <LeftUnitLayout
        items={leftUnits}
        itemHeight={itemHeight}
        itemWidth={leftBarWidth}
        containerStyle={{ backgroundColor: "bisque" }}
      />
      <CanvasList
        width={canvasWidth}
        height={canvasHeight}
        direction={"horizonal"}
        data={data}
        screenIndex={screenIndex}
        itemSize={itemSize}
        renderItem={renderItem}
      />
    </div>
  );
}

export default MicroSimLayout;
