export interface UnitSimLog {
  unit: string;
  description: string;
}

export type SimLogItem = {
  cycleIndex: number;
  excutedTasks: UnitSimLog[];
};

export type SimLogData = SimLogItem[];
