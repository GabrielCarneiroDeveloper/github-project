import APP_CONFIG from './../../config/app.config'
import elasticsearch, { Client } from 'elasticsearch'

function getELKClient(): Client {
  return new elasticsearch.Client({
    host: `${APP_CONFIG.elk.host}:${APP_CONFIG.elk.port}`, // localhost:9200
    log: APP_CONFIG.elk.logLevel, // error
    apiVersion: APP_CONFIG.elk.apiVersion // 7.4
  })
}

export default getELKClient
