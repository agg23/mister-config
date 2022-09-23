import React from "react";
import { StatusComponent } from "./StatusComponent";
import { PrefixEntry, StatusRegRange, StatusRow } from "./util/status";

interface StatusRowComponentProps {
  row: StatusRow;
}

export const StatusRowComponent: React.FC<StatusRowComponentProps> = ({
  row,
}) => {
  if (row.command === "-") {
    return <hr />;
  }

  const { title, options, status } = displayInfo(row);

  return (
    <div className="config">
      <h3>{title}</h3>
      <pre>{row.config}</pre>
      {!!options && (
        <ul>
          {options?.map((option) => (
            <li dangerouslySetInnerHTML={{ __html: option }}></li>
          ))}
        </ul>
      )}
      {!!status && <StatusComponent status={status} />}
    </div>
  );
};

interface StatusRowInfo {
  title: string;
  options?: string[];
  status?: StatusRegRange;
}

const fileExtensionRegex = /.{1,3}/g;

const displayInfo = ({
  command,
  prefixes,
  data: { indexes: indexLetters, segments },
}: StatusRow): StatusRowInfo => {
  const options = prefixes ? prefixDescription(prefixes) : undefined;

  const indexes = indexLetters.map((index) => {
    const code = index.charCodeAt(0);
    if (code >= 97) {
      // Lowercase letter
      return code - 97;
    } else if (code >= 65) {
      // Uppercase letter
      return code - 65;
    } else if (code >= 48) {
      // Number
      return code - 48;
    } else {
      console.error(`Unknown index character "${index[0]}, with code ${code}"`);
      // Large negative so it's clearly out of range
      return -65;
    }
  });

  switch (command) {
    case "option":
      return {
        title: `Custom option: ${segments[0]}`,
        options,
      };
    case "C":
      return {
        title: `Cheat option: ${segments.length > 0 ? segments[0] : "unamed"}`,
        options,
      };
    case "CHEAT":
      return {
        title: "Enables cheat section of OSD",
        options,
      };
    case "DIP":
      return {
        title: "Enables DIP section of OSD, populated from MRA",
        options,
      };
    case "F":
    case "FS":
    case "FC": {
      let localOptions: string[] = [];

      if (command === "FC") {
        localOptions.push("Remember file after loading");
      } else if (command === "FS") {
        localOptions.push("Save supported");
      }

      if (indexes.length > 0) {
        // TODO: Display extension index?
        localOptions.push(`<pre>ioctl_index == ${indexes[0]}</pre>`);
      }

      // Segment 0 - extensions
      const extensions = segments[0].match(fileExtensionRegex) ?? [];
      localOptions.push(`File extensions: ${extensions.join(", ")}`);

      if (segments.length > 1) {
        // Segment 1 - Description of file to load
        localOptions.push(
          `OSD text: ${segments[1].length > 0 ? segments[1] : "Load *"}`
        );
      }

      if (segments.length > 2) {
        // Segment 2 - Load address
        localOptions.push(`Load address: ${segments[2]}`);
      }

      return {
        title: "Load file button",
        options: [...localOptions, ...(options ?? [])],
      };
    }
    case "O":
    case "o": {
      const indexModifier = command === "o" ? 32 : 0;

      const status: StatusRegRange =
        indexes.length > 1
          ? {
              kind: "range",
              startIndex: indexes[0] + indexModifier,
              endIndex: indexes[1] + indexModifier,
            }
          : {
              kind: "single",
              index: indexes[0] + indexModifier,
            };

      const localOptions = segments
        .slice(1)
        .map((option) => `Option: ${option}`);

      return {
        title: `Option button: ${segments[0]}`,
        options: [...localOptions, ...(options ?? [])],
        status,
      };
    }
    case "R":
    case "r":
    case "T":
    case "t": {
      const indexModifier = command === "r" || command === "t" ? 32 : 0;

      const localOptions =
        command === "R" ? ["Closes OSD after selection"] : [];

      return {
        title: `Perform action: ${segments[0]}`,
        options: [...localOptions, ...(options ?? [])],
        status: {
          kind: "single",
          index: indexes[0] + indexModifier,
        },
      };
    }
    case "S": {
      let localOptions: string[] = [];

      const extensions = segments[0].match(fileExtensionRegex) ?? [];
      localOptions.push(`File extensions: ${extensions.join(", ")}`);

      if (segments.length > 1) {
        // Segment 1 - Description of file to load
        localOptions.push(
          `OSD text: ${segments[1].length > 0 ? segments[1] : "Load *"}`
        );
      }

      return {
        title: `Mount SD card in slot ${indexes[0]}`,
        options: [...localOptions, ...(options ?? [])],
      };
    }
    // Non-OSD options
    // case "J": {
    //   const localOptions = segments
    //     .slice(1)
    //     .map((option) => `Option: ${option}`);

    //   return {
    //     title: `Option button: ${segments[0]}`,
    //     options: [...localOptions, ...(options ?? [])],
    //     status,
    //   };
    // }
    default:
      return {
        title: `TODO ${command}`,
        options,
      };
  }
};

const prefixDescription = (prefixes: PrefixEntry[]): string[] =>
  prefixes.map((entry) => {
    switch (entry.prefix) {
      case "D":
        return `Disabled when <pre>status[${entry.data.indexes[0]}]</pre> set`;
      case "d":
        return `Disabled when <pre>status[${entry.data.indexes[0]}]</pre> unset`;
      case "H":
        return `Hidden when <pre>status[${entry.data.indexes[0]}]</pre> set`;
      case "h":
        return `Hidden when <pre>status[${entry.data.indexes[0]}]</pre> unset`;
      case "P": {
        const titleString =
          entry.data.segments.length > 0
            ? ` with title ${entry.data.segments[0]}`
            : "";
        return `Display on page ${entry.data.indexes[0]}${titleString}`;
      }
    }
  });
