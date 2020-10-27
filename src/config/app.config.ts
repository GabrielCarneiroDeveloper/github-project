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

  github: {
    baseUrl: string
    accessToken: string
  }

  serve: {
    host: string
    port: number
    logLevel: string
  }

  elk: {
    host: string
    port: string
    apiVersion: string
    logLevel: string
  }

  db: {
    type: string
    host: string
    port: number
    database: string
    user: string
    password: string
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

  github: {
    baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
    accessToken: process.env.GITHUB_TOKEN
  },

  serve: {
    host: process.env.HOST_ADDRESS || 'localhost',
    port: parseInt(process.env.PORT || '3400'),
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  elk: {
    host: process.env.ELK_HOST || 'localhost',
    port: process.env.ELK_PORT || '9200',
    apiVersion: process.env.ELK_VERSION || '7.4',
    logLevel: process.env.ELK_LOG_LEVEL || 'tracer'
  },

  db: {
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || ''),
    type: process.env.DB_TYPE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  logs: {
    basePath: LogsBasePath,
    errorsPath: path.resolve(LogsBasePath, 'errors.log'),
    generalPath: path.resolve(LogsBasePath, 'combined.log')
  }
} as IAPP_CONFIG

export default APP_CONFIG
