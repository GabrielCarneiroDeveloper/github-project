import 'reflect-metadata'
import { App } from './app'
;(async function () {
  const app = new App()
  await app.init()
  app.start()
})()
