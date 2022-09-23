import { Result } from "./types";

export interface StatusRow {
  command: Command | "option";
  prefixes?: PrefixEntry[];

  data: {
    indexes: string[];
    segments: string[];
  };
  config: string;
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

// export type StatusRow = {
//   command: 'C';
//   text?: string;
// } | {
//   command: 'CHEAT'
// } | {
//   command: 'D',
//   index: string;
// } | {
//   command: 'd',
//   index: string;
// } | {
//   command: 'DIP'
// } | {
//   command: "F"
// }

const wrapperRegex = /parameter\s*.*\s*=\s*{?((.|\n|\r)*)}?.*/gm;
const lineRegex = /\s*"(.*);"\s*/;

export interface InvalidRowError {
  message: string;
}

export const parseConfig = (statusConfig: string): StatusRow[] => {
  const matches = wrapperRegex.exec(statusConfig);

  const cleanedString =
    !!matches && matches.length > 1 ? matches[1].trim() : statusConfig;

  return cleanedString.split("\n").flatMap((line) => {
    const lineMatches = lineRegex.exec(line);

    const cleanedLine =
      !!lineMatches && lineMatches.length > 1
        ? lineMatches[1].trim()
        : line.trim();

    return cleanedLine.length > 0 ? [parseLine(cleanedLine)] : [];
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
  "o", // Not in docs, but appears to be used
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

export type Command = typeof knownCommands[number];
export type Prefix = typeof knownPrefixes[number];

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

export const parseLine = (line: string): StatusRow => {
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
    };
  }

  let remainingLine = line.substring(command.length);
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
  };
};
