import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import ReactDom from "react-dom";

import MircoSim, {
  MicroSimScreenData,
  items,
  FilterCondition,
  MircoCycleData,
} from "./microsimLayout/MicroSim";
import "antd/dist/antd.css";
import "./index.css";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { IDataSource } from "./canvasList/types";
import { eq } from "lodash";

export class MircoSimDataSource implements IDataSource<MicroSimScreenData> {
  private filter: FilterCondition | undefined;

  private orignalData: MircoCycleData[];

  private filterData: MircoCycleData[];

  constructor(data: MircoCycleData[], private cyclesPerScreen: number) {
    this.orignalData = data;
    this.filterData = data;
  }

  getDataByPosition(position: number): MicroSimScreenData {
    const startCycle = position * this.cyclesPerScreen;
    const endCycle = startCycle + this.cyclesPerScreen;
    const screenData: MicroSimScreenData = this.filterData.slice(
      startCycle,
      endCycle
    );
    return screenData;
  }

  public getFilterData() {
    return this.filterData;
  }

  public getScreenData() {
    const screenData = [];
    for (let i = 0; i < this.filterData.length; i += this.cyclesPerScreen) {
      screenData.push(this.filterData.slice(i, i + this.cyclesPerScreen));
    }

    return screenData;
  }

  updateData(data: MircoCycleData[]) {
    if (!this.filter) {
      this.orignalData = data;
      this.filterData = data;
    }
    let filterData = data;
    if (this.filter) {
      const search = this.filter.search;
      const units = this.filter.units || [];
      filterData = data.reduce((res: MircoCycleData[], item) => {
        const newItem: MircoCycleData = {
          cycleIndex: item.cycleIndex,
          excutedTasks: Array.from(item.excutedTasks),
        };

        newItem.excutedTasks = newItem.excutedTasks.filter((task) => {
          let canUsed = true;
          if (units.length > 0) {
            canUsed = !!units.find((unit) => unit === task.unit);
          }

          if (search) {
            canUsed = task.description.includes(search);
          }
          return canUsed;
        });

        if (newItem.excutedTasks.length > 0) res.push(newItem);
        return res;
      }, []);
    }
    this.filterData = filterData;
  }

  public setFilterCondition(filter: FilterCondition | undefined) {
    this.filter = filter;
    this.updateData(this.orignalData);
  }

  getDataSize() {
    return Math.ceil(this.filterData.length / this.cyclesPerScreen);
  }

  getRangeDataByIndex(
    startIndex: number,
    endIndex: number
  ): Promise<MicroSimScreenData[]> {
    const data = [];
    for (let i = startIndex; i < endIndex; i++) {
      data.push(this.getDataByPosition(i));
    }
    return Promise.resolve(data);
  }
}

type FilterState = (FilterCondition & { screenIndex?: number }) | undefined;
const Main: FC = () => {
  const [filterData, setFilterData] = useState<FilterState>();
  const dataSourceRef = useRef(new MircoSimDataSource([], 3));
  const [renderItemList, setRenderData] = useState<MicroSimScreenData[]>([]);
  function dataListener(e: any) {
    const data = e.data;
    if (data.type === "fileContent") {
      dataSourceRef.current.updateData(data.payload);
      setRenderData(dataSourceRef.current.getScreenData());
    }
  }

  useEffect(() => {
    window.addEventListener("message", dataListener);
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
      type: "ready",
    });
    return () => window.removeEventListener("message", dataListener);
  }, []);

  const onReset = () => {
    if (filterData !== undefined) {
      const dataSource = dataSourceRef.current;
      dataSource.setFilterCondition(undefined);
      setRenderData(dataSource.getScreenData());
      setFilterData({
        search: undefined,
        units: undefined,
        screenIndex: undefined,
      });
    }
  };

  const onFinished = (v: {
    search: string;
    units: string[];
    screenIndex: number;
  }) => {
    if (!eq(v, filterData)) {
      const dataSource = dataSourceRef.current;
      dataSource.setFilterCondition({ units: v.units, search: v.search });
      setFilterData(v);
      setRenderData(dataSource.getScreenData());
    }
  };
  let screenSize = dataSourceRef.current.getDataSize();
  screenSize = screenSize > 0 ? screenSize - 1 : 0;
  const showUnits = filterData?.units || items;
  const screenIndex = filterData?.screenIndex || 0;

  return (
    <div className="mircrosim-app">
      <Form
        className="header"
        layout="horizontal"
        onReset={onReset}
        onFinish={onFinished}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Form.Item
          name="units"
          label="功能单元"
          style={{
            flex: 4,
            minWidth: 240,
            marginRight: 12,
          }}
        >
          <Select mode="multiple" allowClear>
            {items.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="search"
          label="搜索"
          style={{ flex: 3, marginRight: 12 }}
        >
          <Input.Search allowClear />
        </Form.Item>
        <Form.Item
          name="screenIndex"
          label="显示单元"
          style={{ flex: 2, marginRight: 12 }}
        >
          <InputNumber min={0} max={screenSize > 0 ? screenSize : 0} />
        </Form.Item>
        <Form.Item
          style={{
            flex: 2,
            flexDirection: "row",
            display: "inline-flex",
            justifyContent: "space-around",
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button type="ghost" htmlType="reset">
            取消
          </Button>
        </Form.Item>
      </Form>

      {screenSize > 0 && (
        <MircoSim
          itemSize={screenSize}
          data={renderItemList}
          leftUnits={showUnits}
          screenIndex={screenIndex}
          canvasWidth={800}
          canvasHeight={500}
          leftBarWidth={50}
        />
      )}
    </div>
  );
};

window.addEventListener("load", () => {
  const node = (document as any).getElementById("root");
  ReactDom.render(<Main />, node);
});
