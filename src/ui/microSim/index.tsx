import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import {
  ListChildComponentProps,
  VariableSizeList as List,
} from "react-window";
import "antd/dist/antd.css";
import "./index.css";
import { Button, Form, FormProps, Input, InputNumber, Select } from "antd";
import { eq } from "lodash";
import { UnitSimLog, SimLogItem, SimLogData } from "./types";

const useResizeHook = (deps: any) => {
  const [width, setWidth] = useState(document.body.clientWidth);
  useEffect(() => {
    const throft = function (fn: () => void, timeout = 300) {
      let timeTicks: NodeJS.Timeout | undefined = undefined;
      return function (...args: any) {
        console.log("call resize");
        if (timeTicks) {
          console.log("clear");
          clearTimeout(timeTicks);
        }
        timeTicks = setTimeout(() => {
          const res = fn.apply(undefined, args);
        }, timeout);
      };
    };
    const resize = throft(() => {
      setWidth(document.body.clientWidth);
    }, undefined);
    window.onresize = resize;
    return () => {
      window.onresize = null;
    };
  }, deps);
  return width;
};

const leftUnitWidth = 120;
const itemHeight = 80;
const logFontSize = 12;

function getMarkHtmlTagText(text: string, markStr: string) {
  if (!text) return text;
  const innerHtml = text.replace(
    markStr,
    `<span style='background:red'>${markStr}</span>`
  );
  return `<span>${innerHtml}</span>`;
}

type SearchFormProps = {
  computedUnits: string[];
} & Partial<FormProps>;

export const SearchForm = (props: SearchFormProps) => {
  const { onReset, onFinish, computedUnits } = props;
  return (
    <Form
      className="header form-style"
      layout="horizontal"
      onReset={onReset}
      onFinish={onFinish}
    >
      <Form.Item
        name="units"
        label="筛选想要显示的单元"
        style={{
          flex: 4,
          marginRight: 12,
          zIndex: 10,
        }}
      >
        <Select mode="multiple" allowClear>
          {computedUnits.map((item) => (
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
        label="跳转Cycle"
        style={{ flex: 2, marginRight: 12 }}
      >
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item
        style={{
          flex: 2,
          flexDirection: "row",
          display: "inline-flex",
          justifyContent: "space-around",
        }}
      >
        <Button type="primary" htmlType="submit" style={{ marginRight: "8px" }}>
          提交
        </Button>
        <Button type="ghost" htmlType="reset">
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

const SideBar = (props: { units: string[] }) => {
  const { units } = props;
  return (
    <div className="side-bar ">
      {units.map((unit, index) => {
        return (
          <div
            key={`unit-item-${index}`}
            className="unit-item flex-center "
            style={{
              height: itemHeight,
              minHeight: itemHeight,
            }}
          >
            {unit}
          </div>
        );
      })}
    </div>
  );
};

function getNearlyPositionOfSimlogDataIndex(
  cycleIndex: number,
  data: SimLogData
): number {
  if (cycleIndex <= 0) {
    return 0;
  }

  if (cycleIndex >= data[data.length - 1].cycleIndex) {
    return data.length - 1;
  }

  let nearlyIndex = 0;
  let start = 0;
  let end = data.length - 1;
  let mid = Math.round(end / 2);

  while (start != end) {
    const centerIndex = data[mid].cycleIndex;
    if (centerIndex === cycleIndex) {
      nearlyIndex = mid;
      break;
    } else if (centerIndex < cycleIndex) {
      start = mid;
      mid = start + Math.round((end - start) / 2);
    } else {
      end = mid;
      mid = start + Math.round((end - start) / 2);
    }

    //当通过二分定位到区间时,找出最近的一个
    if (end === start + 1) {
      const startCycle = data[start].cycleIndex;
      const endCycle = data[end].cycleIndex;

      nearlyIndex =
        cycleIndex - startCycle < endCycle - cycleIndex ? start : end;
      break;
    }
  }

  return nearlyIndex;
}

export const MircoSimLayout: React.FC = () => {
  const [units, setUnits] = useState<string[]>([]);
  const [simLogData, setSimlogData] = useState<SimLogData>([]);
  const clientWidth = useResizeHook([]);
  const [search, setSearch] = useState("");
  const [filterUnits, setFilterUnits] = useState(units);
  const listRef = useRef<List>(null);

  function dataListener(e: any) {
    const data = e.data;
    switch (data.type) {
      case "baseUnits":
        console.log("setUnits:", data.payload);
        setUnits(data.payload);
        break;
      case "fileContent":
        setSimlogData(data.payload);
        break;
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

  // 更新filtersUnit data
  const computedUnits = useMemo(() => {
    if (filterUnits && filterUnits.length) return filterUnits;
    return units;
  }, [filterUnits, units]);

  const computedLogData = useMemo(() => {
    if (!search) {
      return simLogData;
    }
    const computedData = simLogData.reduce((filterData:SimLogData,simLogItem) => {
      const searchTask = simLogItem.excutedTasks.filter((i) =>
        i.description.includes(search)
      );
      if (searchTask.length > 0) {
        filterData.push( {
          cycleIndex: simLogItem.cycleIndex,
          excutedTasks: searchTask.map((item) => ({
            unit: item.unit,
            description: getMarkHtmlTagText(item.description, search),
          })),
        });
      }
      return filterData;
    },[]);
    return computedData.filter((i) => !!i);
  }, [search, simLogData]);

  const getItemSize = (index: number) => {
    const logItem: SimLogItem = simLogData[index];
    if (
      !logItem ||
      !logItem.excutedTasks ||
      logItem.excutedTasks.length === 0
    ) {
      return 0;
    }

    const maxStrLen = logItem.excutedTasks.reduce((maxLen, unitLog) => {
      return Math.max(maxLen, unitLog.description.length);
    }, 0);

    const letterSpace = 4;
    const logPadding = 6;
    const lineSpace = 4;
    const strWidth = maxStrLen * (logFontSize + letterSpace);

    const maxLines = Math.ceil(
      (itemHeight - logPadding * 2) / (logFontSize + lineSpace)
    );
    return Math.ceil(strWidth / maxLines);
  };

  if (computedUnits.length === 0) {
    return null;
  }

  const listHeight = computedUnits.length * itemHeight + 30;
  const listWidth = clientWidth - leftUnitWidth;

  const Column = (props: ListChildComponentProps<SimLogData>) => {
    const { style, index: itemIndex, data } = props;
    const itemData = data[itemIndex];
    if (!itemData) {
      return null;
    }
    return (
      <div style={{ ...style }}>
        <div
          className="screen-item"
          style={{ height: `${computedUnits.length * itemHeight}px` }}
        >
          {computedUnits.map((unit, unitIndex) => {
            const log = itemData.excutedTasks?.find(
              (item) => item.unit === unit
            );
            return log?.description ? (
              <div
                key={`col-${itemIndex}-${unitIndex}`}
                className="list-item-row flex-center"
                style={{
                  top: `${unitIndex * itemHeight}px`,
                  height: itemHeight,
                  fontSize: logFontSize,
                }}
                dangerouslySetInnerHTML={{ __html: log.description }}
              ></div>
            ) : null;
          })}
        </div>
        <div
          className="flex-center"
          style={{
            position: "absolute",
            width: "100%",
            fontWeight: "400",
            top: `${computedUnits.length * itemHeight}px`,
          }}
        >
          {`${itemIndex} circle:${itemData.cycleIndex}`}
        </div>
      </div>
    );
  };

  const onReset = () => {
    setFilterUnits(units);
    setSearch("");
  };

  const onFinished = (v: {
    search: string;
    units: string[];
    screenIndex: number;
  }) => {
    if (filterUnits && v.units && !eq(filterUnits, v.units)) {
      setFilterUnits(v.units);
    }

    if (search !== v.search) {
      console.log("update search:", search, v.search);
      setSearch(v.search);
    }

    if (v.screenIndex && v.screenIndex > 0) {
      const nearlyIndex = getNearlyPositionOfSimlogDataIndex(
        v.screenIndex,
        computedLogData
      );
      listRef.current?.scrollToItem(nearlyIndex, "center");
    }
  };
  const itemCount = computedLogData.length;

  return (
    <div style={{ height: document.body.clientHeight }}>
      <SearchForm
        onFinish={onFinished}
        computedUnits={computedUnits}
        onReset={onReset}
      />
      <div className="mircosim-container">
        <SideBar units={computedUnits} />

        <List
          height={listHeight}
          layout={"horizontal"}
          itemCount={itemCount}
          itemSize={getItemSize}
          ref={listRef}
          style={{ overflowY: "hidden" }}
          width={listWidth}
          itemData={computedLogData}
        >
          {Column}
        </List>
      </div>
    </div>
  );
};
