import { Connection } from 'typeorm'

export interface IDb {
  init(): Promise<void>
  getInstance(): Connection
}
