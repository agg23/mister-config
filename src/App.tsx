import React, { ChangeEvent, useState } from "react";
import { InvalidRowComponent } from "./InvalidRowComponent";
import { StatusRowComponent } from "./StatusRowComponent";
import { InvalidRowError, parseConfig, StatusRow } from "./util/status";
import "./index.css";

export const App = () => {
  const [state, setState] = useState<StatusRow[]>();

  const onTextChange = (input: ChangeEvent<HTMLTextAreaElement>) => {
    setState(parseConfig(input.target.value));
  };

  return (
    <div>
      <div className="textareaWrapper">
        <div>Enter CONF_STR:</div>
        <textarea onChange={onTextChange}></textarea>
      </div>
      <div>
        <h2>Configuration</h2>
        <div>
          {state?.map((row, i) => (
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
