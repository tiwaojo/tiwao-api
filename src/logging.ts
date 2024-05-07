import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
      format.label({
          label: "GraphQL",
          message: false,
        }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.prettyPrint(),
  ),
    defaultMeta: { service: 'api-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.Console({
      level: "info",
      format: format.combine(
        format.colorize(
            {
                all: true,
                level: true,
                message: false
            }
        ),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
        )
      ),
    }),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

//
// If we're not production then log to the `console` with the json format:
//
if (process.env.NODE_ENV === "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
        format.colorize({
          all: true,
          level: true,
        })
      ),
      level: "error",
    })
  );
}

export default logger;
