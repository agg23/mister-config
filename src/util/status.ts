export interface StatusRow {
  command: Command | "option";
  prefixes?: PrefixEntry[];

  data: {
    indexes: string[];
    segments: string[];
  };
  config: string;
  lineNumber: number;
}

export interface PrefixEntry {
  prefix: Prefix;

  data: {
    indexes: string[];
    segments: string[];
  };
}

export type StatusRegRange =
  | {
      kind: "single";
      index: number;
    }
  | {
      kind: "range";
      startIndex: number;
      endIndex: number;
    };

const wrapperRegex =
  /(?:(?:parameter|localparam)\s*?.*?\s*?=\s*?{?)?([\S\s]*)}?/m;
const lineRegex = /\s*"(.*);"\s*/;

export interface InvalidRowError {
  message: string;
}

export const parseConfig = (statusConfig: string): StatusRow[] => {
  const matches = wrapperRegex.exec(statusConfig);

  const cleanedString =
    !!matches && matches.length > 1 ? matches[1].trim() : statusConfig;

  return cleanedString.split("\n").flatMap((line, i) => {
    if (i === 0) {
      // First entry is the name of the core, which isn't relevant
      return [];
    }

    const lineMatches = lineRegex.exec(line);

    const cleanedLine =
      !!lineMatches && lineMatches.length > 1
        ? lineMatches[1].trim()
        : line.trim();

    return cleanedLine.length > 0 ? [parseLine(cleanedLine, i)] : [];
  });
};

const knownCommands = [
  // OSD
  "CHEAT",
  "C",
  "DIP",
  "D",
  "d",
  "FC",
  "FS",
  "F",
  "O",
  "o",
  "P",
  "R",
  "r",
  "S",
  "T",
  "t",
  "-",
  //  Non-OSD
  "J",
  "jn",
  "jp",
  "V",
  "I",
  "DEFMRA",
] as const;

const knownPrefixes = ["D", "d", "H", "h", "P"] as const;

export type Command = (typeof knownCommands)[number];
export type Prefix = (typeof knownPrefixes)[number];

const buildPrefixes = (
  line: string,
  prefixes?: PrefixEntry[]
): {
  prefixes?: PrefixEntry[];
  line: string;
} => {
  const prefix = knownPrefixes.find((prefix) => line.startsWith(prefix));

  if (!prefix) {
    // We're done consuming prefixes
    return {
      prefixes,
      line,
    };
  }

  let remainingLine = line.substring(prefix.length);
  let segments = remainingLine.split(",");

  // First character of first segment
  const hasIndex = segments.length > 0 && segments[0].length > 0;
  const indexes = hasIndex ? [segments[0][0]] : [];

  return buildPrefixes(remainingLine.substring(hasIndex ? 1 : 0), [
    ...(prefixes ?? []),
    {
      prefix,
      data: {
        indexes,
        segments: segments.slice(1),
      },
    },
  ]);
};

export const parseLine = (line: string, lineNumber: number): StatusRow => {
  const { prefixes, line: prefixLine } = buildPrefixes(line);

  const command = knownCommands.find((command) =>
    prefixLine.startsWith(command)
  );

  if (!command) {
    return {
      command: "option",
      data: {
        indexes: [],
        segments: prefixLine.split(","),
      },
      config: line,
      lineNumber,
    };
  }

  let remainingLine = prefixLine.substring(command.length);
  let segments = remainingLine.split(",");

  let indexes: string[] = [];

  const initialSegment = segments.length > 0 ? segments[0] : undefined;

  if (!!initialSegment && initialSegment.length > 0) {
    // First item, before comma
    // Each character is an index
    indexes = [...initialSegment];
  }

  return {
    command,
    prefixes,

    data: {
      indexes,
      segments: segments.slice(1),
    },
    config: line,
    lineNumber,
  };
};
