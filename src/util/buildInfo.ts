import { PrefixEntry, StatusRegRange, StatusRow } from "./status";

export interface StatusRowInfo {
  title: string;
  command: string;
  config: string;
  lineNumber: number;
  options?: string[];
  status?: StatusRegRange;
  prefixOptions: string[];
  prefixStatus: Array<StatusRegRange | undefined>;
}

const fileExtensionRegex = /.{1,3}/g;

const indexToNumber = (index: string): number => {
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
  }

  console.error(`Unknown index character "${index[0]}, with code ${code}"`);
  // Large negative so it's clearly out of range
  return -65;
};

export const buildInfo = ({
  command,
  prefixes,
  config,
  lineNumber,
  data: { indexes: indexLetters, segments },
}: StatusRow): StatusRowInfo => {
  const prefixDescriptions = prefixes ? prefixDescription(prefixes) : [];

  let prefixOptions: string[] = [];
  let prefixStatus: Array<StatusRegRange | undefined> = [];
  prefixDescriptions.forEach(({ title, status }) => {
    prefixOptions.push(title);
    prefixStatus.push(status);
  });

  const indexes = indexLetters.map(indexToNumber);

  const baseInfo = {
    command,
    config,
    lineNumber,
    prefixOptions,
    prefixStatus,
  };

  switch (command) {
    case "option":
      return {
        title: `Custom option: ${segments[0]}`,
        ...baseInfo,
      };
    case "C":
      return {
        title: `Cheat option: ${segments.length > 0 ? segments[0] : "unamed"}`,
        ...baseInfo,
      };
    case "CHEAT":
      return {
        title: "Enables cheat section of OSD",
        ...baseInfo,
      };
    case "DIP":
      return {
        title: "Enables DIP section of OSD, populated from MRA",
        ...baseInfo,
      };
    case "F":
    case "FS":
    case "FC": {
      let options: string[] = [];

      if (command === "FC") {
        options.push("Remember file after loading");
      } else if (command === "FS") {
        options.push("Save supported");
      }

      if (indexes.length > 0) {
        // TODO: Display extension index?
        options.push(`<pre>ioctl_index == ${indexes[0]}</pre>`);
      }

      // Segment 0 - extensions
      const extensions = segments[0].match(fileExtensionRegex) ?? [];
      options.push(`File extensions: ${extensions.join(", ")}`);

      if (segments.length > 1) {
        // Segment 1 - Description of file to load
        options.push(
          `OSD text: ${segments[1].length > 0 ? segments[1] : "Load *"}`
        );
      }

      if (segments.length > 2) {
        // Segment 2 - Load address
        options.push(`Load address: ${segments[2]}`);
      }

      return {
        title: "Load file button",
        options,
        ...baseInfo,
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

      const options = segments.slice(1).map((option) => `Option: ${option}`);

      return {
        title: `Option button: ${segments[0]}`,
        options,
        status,
        ...baseInfo,
      };
    }
    case "R":
    case "r":
    case "T":
    case "t": {
      const indexModifier = command === "r" || command === "t" ? 32 : 0;

      const options = command === "R" ? ["Closes OSD after selection"] : [];

      return {
        title: `Perform action: ${segments[0]}`,
        options,
        status: {
          kind: "single",
          index: indexes[0] + indexModifier,
        },
        ...baseInfo,
      };
    }
    case "S": {
      let options: string[] = [];

      const extensions = segments[0].match(fileExtensionRegex) ?? [];
      options.push(`File extensions: ${extensions.join(", ")}`);

      if (segments.length > 1) {
        // Segment 1 - Description of file to load
        options.push(
          `OSD text: ${segments[1].length > 0 ? segments[1] : "Load *"}`
        );
      }

      return {
        title: `Mount SD card in slot ${indexes[0]}`,
        options,
        ...baseInfo,
      };
    }
    // Non-OSD options
    // case "J": {
    //   const options = segments
    //     .slice(1)
    //     .map((option) => `Option: ${option}`);

    //   return {
    //     title: `Option button: ${segments[0]}`,
    //     options: [...options, ...(options ?? [])],
    //     status,
    //   };
    // }
    default:
      return {
        title: `TODO ${command}`,
        ...baseInfo,
      };
  }
};

const prefixDescription = (
  prefixes: PrefixEntry[]
): Array<{
  title: string;
  status?: StatusRegRange;
}> =>
  // eslint-disable-next-line array-callback-return
  prefixes.map((entry) => {
    switch (entry.prefix) {
      case "D":
        return {
          title: `Disabled when <pre>status[${entry.data.indexes[0]}]</pre> set`,
          status: {
            kind: "single",
            index: indexToNumber(entry.data.indexes[0]),
          },
        };
      case "d":
        return {
          title: `Disabled when <pre>status[${entry.data.indexes[0]}]</pre> unset`,
          status: {
            kind: "single",
            index: indexToNumber(entry.data.indexes[0]),
          },
        };
      case "H":
        return {
          title: `Hidden when <pre>status[${entry.data.indexes[0]}]</pre> set`,
          status: {
            kind: "single",
            index: indexToNumber(entry.data.indexes[0]),
          },
        };
      case "h":
        return {
          title: `Hidden when <pre>status[${entry.data.indexes[0]}]</pre> unset`,
          status: {
            kind: "single",
            index: indexToNumber(entry.data.indexes[0]),
          },
        };
      case "P": {
        const titleString =
          entry.data.segments.length > 0
            ? ` with title ${entry.data.segments[0]}`
            : "";
        return {
          title: `Display on page ${entry.data.indexes[0]}${titleString}`,
        };
      }
    }
  });
