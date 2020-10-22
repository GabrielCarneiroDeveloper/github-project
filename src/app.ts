import cors from 'cors'
import path from 'path'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import express, { Response, Router } from 'express'
import { load } from 'yamljs'

import logger from './common/logger/logger'
import { DTOController } from './common/dto/DTOController'
import { IDb } from './common/database/IDb'
import { Db } from './common/database/Db'

import APP_CONFIG from './config/app.config'
import { GithubController } from './modules/github/github.controller'

export interface IApp {
  init(): Promise<void>
  start(): void
  initDatabase(): Promise<void>
  initMiddlewares(): void
}

export class App implements IApp {
  application: express.Application
  route: Router

  constructor() {
    this.application = express()
    this.route = Router()
  }

  async init(): Promise<void> {
    this.initMiddlewares()
    await this.initDatabase()

    this.route.get('/', (_, response: Response) => {
      response.json({
        message: `Server is running on port ${APP_CONFIG.serve.port}`
      })
    })

    await this.initApiSummarize(this.route)
    await this.initModule(GithubController, this.route)
  }

  async initApiSummarize(route: Router): Promise<void> {
    const swaggerDoc = load(path.resolve(__dirname, 'doc', 'swagger.yml'))
    swaggerDoc.servers = swaggerDoc.servers.map(
      (host: { url: string; description: string }) => {
        host.url = host.url.replace(
          'HOST_ADDRESS_AND_PORT', // this should be in swagger.yml to be replaced
          `${APP_CONFIG.serve.host}:${APP_CONFIG.serve.port}`
        )
        return host
      }
    )

    route.use('/apidoc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
  }

  async initModule(ControllerClassName: any, route: Router): Promise<void> {
    const controller = new ControllerClassName({
      route
    } as DTOController)
    await controller.init()
    this.application.use(route)
    logger.debug('Successfully loaded module ' + controller.constructor.name)
  }

  async initDatabase(): Promise<void> {
    const db: IDb = new Db()
    await db.init()
    logger.info('Successfully loaded Database')
  }

  initMiddlewares(): void {
    this.application.use(express.json())
    this.application.use(express.static(path.join(__dirname, 'public')))
    this.application.use(cors())
    this.application.use(helmet())
    logger.info('Successfully loaded Middlewares')
  }

  start(): void {
    this.application.listen(APP_CONFIG.serve.port, () => {
      logger.info(`-- Server running on port ${APP_CONFIG.serve.port} --`)
    })
  }
}
