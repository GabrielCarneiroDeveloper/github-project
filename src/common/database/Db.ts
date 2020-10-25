import { Connection, createConnection } from 'typeorm'

import { IDb } from './../../common/database/IDb'
import logger from '../logger/logger'
import APP_CONFIG from '@src/config/app.config'
import { GithubIssue, GithubRepo } from '@src/modules/github/github.models'

export class Db implements IDb {
  private instance: Connection

  async init(): Promise<void> {
    try {
      this.instance = await createConnection({
        useUnifiedTopology: true,
        synchronize: true,
        logging: false,
        type: 'mongodb',
        host: APP_CONFIG.db.host,
        port: APP_CONFIG.db.port,
        database: APP_CONFIG.db.database,
        username: APP_CONFIG.db.user,
        password: APP_CONFIG.db.password,
        entities: [GithubRepo, GithubIssue]
        // migrations: ['src/common/database/migrations/*.ts'],
        // subscribers: ['src/modules/**/*.ts'],
        // cli: {
        //   entitiesDir: 'src/modules/**/',
        //   migrationsDir: 'src/migration',
        //   subscribersDir: 'src/modules/**/'
        // }
      })
      await this.instance.synchronize()
    } catch (error) {
      logger.error('Error at try to connect in database...')
      throw error
    }
  }

  getInstance(): Connection {
    return this.instance
  }
}
