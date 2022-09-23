import React from "react";
import { StatusComponent } from "./StatusComponent";
import { StatusRowInfo } from "./util/buildInfo";

interface StatusRowComponentProps {
  row: StatusRowInfo;
}

export const StatusRowComponent: React.FC<StatusRowComponentProps> = ({
  row,
}) => {
  if (row.command === "-") {
    return <hr />;
  }

  const { title, options, prefixOptions, status, config, lineNumber } = row;

  return (
    <div className="config">
      <h3 id={config}>{title}</h3>
      <pre>
        {config} (line {lineNumber})
      </pre>
      {!!options && (
        <ul>
          {options?.map((option) => (
            <li dangerouslySetInnerHTML={{ __html: option }}></li>
          ))}
        </ul>
      )}
      {prefixOptions.length > 0 && (
        <div>
          <h4>Prefix</h4>
          <ul>
            {prefixOptions?.map((option) => (
              <li dangerouslySetInnerHTML={{ __html: option }}></li>
            ))}
          </ul>
        </div>
      )}
      {!!status && <StatusComponent status={status} />}
      <a className="backToTop" href="#">
        Top
      </a>
    </div>
  );
};
