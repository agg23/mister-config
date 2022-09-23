import React from "react";
import { StatusRegRange } from "./util/status";

interface StatusProps {
  status: StatusRegRange;
}

export const StatusComponent: React.FC<StatusProps> = ({ status }) => {
  return status.kind === "single" ? (
    <pre>status[{status.index}]</pre>
  ) : (
    <pre>
      status[{status.endIndex}:{status.startIndex}]
    </pre>
  );
};
