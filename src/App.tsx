import React, { ChangeEvent, useState } from "react";
import { InvalidRowComponent } from "./InvalidRowComponent";
import { StatusRowComponent } from "./StatusRowComponent";
import { InvalidRowError, parseConfig, StatusRow } from "./util/status";
import "./index.css";
import { buildInfo, StatusRowInfo } from "./util/buildInfo";
import { buildStatusMap } from "./util/map";
import { StatusMap } from "./StatusMap";

interface State {
  rows: StatusRowInfo[];
  map: Map<number, StatusRowInfo>;
}

export const App = () => {
  const [state, setState] = useState<State | undefined>();

  const onTextChange = (input: ChangeEvent<HTMLTextAreaElement>) => {
    const rows = parseConfig(input.target.value).map(buildInfo);

    setState({
      rows,
      map: buildStatusMap(rows),
    });
  };

  return (
    <div>
      <div className="textareaWrapper">
        <div>Enter CONF_STR:</div>
        <textarea onChange={onTextChange}></textarea>
      </div>
      <div>
        <h2>Status</h2>
        {state?.map && <StatusMap map={state.map} />}
        <h2>Configuration</h2>
        <div>
          {state?.rows.map((row, i) => (
            // TODO: Use real key?
            <div key={i}>
              <StatusRowComponent row={row} />
              {/* {row.kind === "ok" ? (
                <StatusRowComponent row={row.value} />
              ) : (
                <InvalidRowComponent error={row.value} />
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
