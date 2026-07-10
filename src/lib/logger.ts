import "server-only";

type LogLevel = "info" | "warn" | "error";
type SafeLogValue = string | number | boolean | null | undefined;
type SafeLogMetadata = Record<string, SafeLogValue>;

function cleanMetadata(metadata: SafeLogMetadata) {
  return Object.fromEntries(
    Object.entries(metadata).filter((entry): entry is [string, Exclude<SafeLogValue, undefined>] => {
      const [, value] = entry;
      return value !== undefined;
    }),
  );
}

function writeLog(level: LogLevel, event: string, metadata: SafeLogMetadata = {}) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    metadata: cleanMetadata(metadata),
  });

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logInfo(event: string, metadata?: SafeLogMetadata) {
  writeLog("info", event, metadata);
}

export function logWarn(event: string, metadata?: SafeLogMetadata) {
  writeLog("warn", event, metadata);
}

export function logError(event: string, metadata?: SafeLogMetadata) {
  writeLog("error", event, metadata);
}

export function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : typeof error;
}
