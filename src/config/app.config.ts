import fs from 'fs'
import path from 'path'
import logger from './../common/logger/logger'
import loadDotEnv from './../common/environments/loadDotEnv'

loadDotEnv()

const currentDate = new Date()
const currentDateLogsFolderNamePaths = `${currentDate.getDate()}${currentDate.getMonth()}${currentDate.getFullYear()}`
const LogsBasePath = path.resolve(__dirname, '..', '..', 'logs', currentDateLogsFolderNamePaths)

function readVersionFile(): string {
  const versionFilePath = path.resolve(__dirname, '..', '..', '.version')
  let versionFile = ''
  fs.readFile(versionFilePath, 'utf8', (error, vf) => {
    if (error) {
      logger.error(error.message)
    }
    versionFile = vf
  })
  return versionFile
}

interface IAPP_CONFIG {
  projectName: string
  jwtSecretkey: string
  version: string
  serve: {
    host: string
    port: number
    logLevel: string
  }
  logs: {
    basePath: string
    errorsPath: string
    generalPath: string
  }
}

const APP_CONFIG = {
  projectName: 'github-project',
  jwtSecretkey: process.env.JWT_SECRET_KEY,
  version: readVersionFile(),
  serve: {
    host: process.env.HOST_ADDRESS || '0.0.0.0',
    port: parseInt(process.env.PORT || '3400'),
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  logs: {
    basePath: LogsBasePath,
    errorsPath: path.resolve(LogsBasePath, 'errors.log'),
    generalPath: path.resolve(LogsBasePath, 'combined.log')
  }
} as IAPP_CONFIG

export default APP_CONFIG
