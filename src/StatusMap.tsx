import React from "react";
import { StatusRowInfo } from "./util/buildInfo";

interface StatusMapProps {
  map: Map<number, StatusRowInfo>;
}

const [reverseStatusIndexesHigh, reverseStatusIndexesLow] = (() => {
  let indexesHigh: number[] = [];
  let indexesLow: number[] = [];

  for (let i = 0; i < 64; i++) {
    if (i < 32) {
      indexesHigh.push(63 - i);
    } else {
      indexesLow.push(63 - i);
    }
  }

  return [indexesHigh, indexesLow];
})();

export const StatusMap: React.FC<StatusMapProps> = ({ map }) => {
  return (
    <div>
      <MapRow indexes={reverseStatusIndexesHigh} map={map} />
      <MapRow indexes={reverseStatusIndexesLow} map={map} />
    </div>
  );
};

const MapRow: React.FC<{
  indexes: number[];
  map: Map<number, StatusRowInfo>;
}> = ({ indexes, map }) => {
  return (
    <div className="mapRow">
      {indexes.map((index) => {
        const info = map.get(index);

        if (!info) {
          return <div key={index}>{index}</div>;
        }

        return (
          <a
            key={index}
            href={`#${info.config}`}
            title={`${info.config} (line ${info.lineNumber})`}
          >
            {index}
          </a>
        );
      })}
    </div>
  );
};
