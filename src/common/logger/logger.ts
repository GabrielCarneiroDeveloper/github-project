import winston, { format, transports } from 'winston'
import fs from 'fs'

import APP_CONFIG from '../../config/app.config'
import { LOG_LEVEL } from './logger.enum'

const { combine, splat, timestamp, printf, colorize, uncolorize } = format

if (!fs.existsSync(APP_CONFIG.logs.basePath)) {
  try {
    fs.mkdirSync(APP_CONFIG.logs.basePath)
  } catch (error) {
    throw new Error('Could not create the folder ' + APP_CONFIG.logs.basePath)
  }
}

const loggerConfigs = {
  timestampFormat: 'YYYY-MM-DD HH:mm:ss',
  serviceName: APP_CONFIG.projectName,
  errorLogFilename: APP_CONFIG.logs.errorsPath,
  generalLogFilename: APP_CONFIG.logs.generalPath
}

const myFormat = printf(({ level, message, timestamp }) => {
  let msg = `${timestamp} | ${level} | `
  if (typeof message !== 'string' && typeof message !== 'number') {
    msg += JSON.stringify(message)
  } else {
    msg += message
  }
  return msg
})

const logger = winston.createLogger({
  level: APP_CONFIG.serve.logLevel,
  format: combine(colorize(), splat(), timestamp({ format: loggerConfigs.timestampFormat })),
  transports: [
    new transports.Console({
      format: myFormat
    }),
    new transports.File({
      filename: loggerConfigs.errorLogFilename,
      format: combine(uncolorize(), myFormat),
      level: LOG_LEVEL.ERROR
    }),
    new transports.File({
      filename: loggerConfigs.generalLogFilename,
      format: combine(uncolorize(), myFormat),
      level: LOG_LEVEL.INFO
    })
  ]
})

export default logger
