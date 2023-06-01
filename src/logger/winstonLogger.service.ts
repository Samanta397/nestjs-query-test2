import {Injectable, LoggerService} from "@nestjs/common";
import {format, transports, createLogger} from "winston";
const LokiTransport = require('winston-loki');
import  { ElasticsearchTransport } from 'winston-elasticsearch';


const myCustomLevels = {
  levels: {
    error: 0,
    warning: 1,
    debug: 2,
    info: 3,
    verbose: 4,
    audit: 5
  },
  colors: {
    audit: 'blue',
  }
};

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger;

  constructor() {
    this.logger = createLogger({
      levels: myCustomLevels.levels,
      transports: [
        // new ElasticsearchTransport({
        //   level: 'audit',
        //   indexPrefix: 'my-app',
        //   clientOpts: { node: 'http://localhost:9200' }
        // }),
        new LokiTransport({
          host: 'http://localhost:3100',
          level: 'audit',
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          // format: format.combine(format.timestamp(), format.json()),
        }),

        // let's log errors into its own file
        new transports.File({
          filename: `logs/error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        // logging all level
        new transports.File({
          filename: `logs/combined.log`,
          format: format.combine(format.timestamp(), format.json()),
        }),
        // we also want to see logs in our console
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'exception.log' }),
      ],
      rejectionHandlers: [
        new transports.File({ filename: 'rejections.log' }),
      ],
    })
  }

  log(message: string) {
    this.logger.info(message);
  }

  audit(message: string) {
    this.logger.audit(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}