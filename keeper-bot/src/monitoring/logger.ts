import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

const structuredFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export function createLogger(level: string = "info"): winston.Logger {
  return winston.createLogger({
    level,
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      json()
    ),
    defaultMeta: { service: "keeper-bot" },
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
          structuredFormat
        ),
      }),
      new winston.transports.File({
        filename: "keeper-bot.log",
        format: combine(
          timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
          json()
        ),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
    ],
  });
}
