import { Request, Response, Router } from 'express'

export interface IAbstractController {
  list(request: Request, response: Response): Promise<Response>
  listOneById(request: Request, response: Response): Promise<Response>
  create(request: Request, response: Response): Promise<Response>
  update(request: Request, response: Response): Promise<Response>
  remove(request: Request, response: Response): Promise<Response>
}
export interface IController extends IAbstractController {
  init(route: Router): Promise<void>
}
