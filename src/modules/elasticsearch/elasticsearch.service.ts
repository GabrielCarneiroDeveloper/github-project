import APP_CONFIG from './../../config/app.config'
import Axios, { AxiosInstance } from 'axios'

export interface IElasticSearchService {
  checkElasticSearchIsRunning(): Promise<boolean>
}

export class ElasticSearchService implements IElasticSearchService {
  axios: AxiosInstance
  constructor() {
    this.axios = Axios.create({
      baseURL: `http://${APP_CONFIG.elk.host}:${APP_CONFIG.elk.port}`
    })
  }

  async checkElasticSearchIsRunning(): Promise<any> {
    return await this.axios.get('/')
  }
}
