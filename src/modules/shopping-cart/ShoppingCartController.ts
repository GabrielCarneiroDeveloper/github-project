import { Router } from 'express'

import { IController } from './../../interfaces/IControllers'
import { DTOController } from './../../common/dto/DTOController'
import { AbstractController } from '../abstract.controller'
import { ShoppingCart } from './ShoppingCart'

export class ShoppingCartController extends AbstractController implements IController {
  route: Router

  constructor({ route }: DTOController) {
    super()
    this.route = route
    this.ModelClassName = ShoppingCart
    this.findManyOptions = { relations: ['status', 'client', 'cashier', 'seller', 'clothes'] }
    this.findOneOptions = { relations: ['status', 'client', 'cashier', 'seller', 'clothes'] }
  }

  async init(): Promise<void> {
    this.route.get('/shopping-cart', this.list)
    this.route.post('/shopping-cart', this.create)
    this.route.get('/shopping-cart/:id', this.listOneById)
    this.route.put('/shopping-cart/:id', this.update)
    this.route.delete('/shopping-cart/:id', this.remove)
  }
}
