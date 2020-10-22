import { Schema } from 'joi'

export function checkRequestPayload(data: any, validator: Schema): void {
  const result = validator.validate(data)
  if (result.error) {
    throw new Error(result.error.message)
  }
}
