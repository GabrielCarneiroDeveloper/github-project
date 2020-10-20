import { Connection, createConnection } from 'typeorm'

import { IDb } from './../../common/database/IDb'
import logger from '../logger/logger'

export class Db implements IDb {
  private instance: Connection

  async init(): Promise<void> {
    try {
      this.instance = await createConnection({
        synchronize: true,
        logging: false,
        type: 'sqlite',
        database: './data/data.db',
        entities: ['./modules/**/*.ts'],
        migrations: ['./common/database/migrations/*.ts'],
        subscribers: ['./modules/**/*.ts'],
        cli: {
          entitiesDir: './modules/**/',
          migrationsDir: './migration',
          subscribersDir: './modules/**/'
        }
      })
    } catch (error) {
      logger.error('Error at try to connect in database...')
      throw error
    }
  }

  getInstance(): Connection {
    return this.instance
  }
}
