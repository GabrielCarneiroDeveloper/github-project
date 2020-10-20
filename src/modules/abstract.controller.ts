import { IAbstractController } from './../interfaces/IControllers'
import { Request, Response } from 'express'
import { FindManyOptions, FindOneOptions, getRepository, RemoveOptions, SaveOptions } from 'typeorm'

export class AbstractController implements IAbstractController {
  ModelClassName: any
  findManyOptions: FindManyOptions
  saveOptions: SaveOptions
  findOneOptions: FindOneOptions
  removeOptions: RemoveOptions

  list = async (_: Request, response: Response): Promise<Response> => {
    try {
      const repository = getRepository(this.ModelClassName)
      const objectList = await repository.find(this.findManyOptions)
      return response.json(objectList)
    } catch (error) {
      console.error(error)
      return response.status(401).json({
        message: 'an error occurred',
        error_message: error.message
      })
    }
  }

  listOneById = async (request: Request, response: Response): Promise<Response> => {
    try {
      const id = request.params.id
      const repository = getRepository(this.ModelClassName)
      const foundObject = await repository.findOne(id, this.findOneOptions)
      if (!foundObject) {
        throw new Error('Object not found')
      }
      return response.json(foundObject)
    } catch (error) {
      console.error(error)
      return response.status(401).json({
        message: 'an error occurred',
        error_message: error.message
      })
    }
  }

  create = async (request: Request, response: Response): Promise<Response> => {
    try {
      const data = request.body
      const repository = getRepository(this.ModelClassName)
      const createdObject = await repository.save(data, this.saveOptions)
      return response.json({
        message: 'Object created',
        data: createdObject
      })
    } catch (error) {
      console.error(error)
      return response.status(401).json({
        message: 'An error occurred',
        error_message: error.message
      })
    }
  }

  update = async (request: Request, response: Response): Promise<Response> => {
    try {
      const data = request.body
      const id = request.params.id
      const repository = getRepository(this.ModelClassName)
      await repository.update(id, data)
      const updateObject = await repository.findOneOrFail(id, this.findOneOptions)
      return response.json({
        message: 'Object updated',
        data: updateObject
      })
    } catch (error) {
      console.error(error)
      return response.status(401).json({
        message: 'An error occurred',
        error_message: error.message
      })
    }
  }

  remove = async (request: Request, response: Response): Promise<Response> => {
    try {
      const id = request.params.id
      const repository = getRepository(this.ModelClassName)
      const foundObject = await repository.findOneOrFail(id, this.findOneOptions)
      await repository.remove(foundObject, this.removeOptions)
      return response.json({
        message: 'Object removed'
      })
    } catch (error) {
      console.error(error)
      return response.status(401).json(error)
    }
  }
}
