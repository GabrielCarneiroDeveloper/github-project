import { Environments } from './environments.enum'

import { config } from 'dotenv'
import path from 'path'

export default function () {
  if (process.env.NODE_ENV === Environments.DEVELOPMENT) {
    config({ path: path.join(__dirname, '..', '..', '..', '.env') })
  } else {
    config()
  }
}
