import { StatusRowInfo } from "./buildInfo";
import { StatusRegRange } from "./status";

export const buildStatusMap = (
  rows: StatusRowInfo[]
): Map<number, StatusRowInfo> => {
  const map = new Map<number, StatusRowInfo>();

  for (const row of rows) {
    for (const status of row.prefixStatus) {
      addStatusToMap(map, status, row);
    }
    addStatusToMap(map, row.status, row);
  }

  return map;
};

const addStatusToMap = <T>(
  map: Map<number, T>,
  status: StatusRegRange | undefined,
  value: T
) => {
  if (!status) {
    return;
  }

  if (status.kind === "single") {
    map.set(status.index, value);
  } else {
    for (let i = status.startIndex; i <= status.endIndex; i++) {
      map.set(i, value);
    }
  }
};
