import Joi from 'joi'
import { IssueStatesEnum } from './github.enum'

const ProjectTrackValidator = Joi.object({
  owner: Joi.string().required().not().empty(),
  repo: Joi.string().required().not().empty()
})

const checkIfIssueStateIsValid = (state: IssueStatesEnum): void => {
  if (!Object.values(IssueStatesEnum).includes(state)) {
    throw new Error('state is invalid')
  }
}

export { ProjectTrackValidator, checkIfIssueStateIsValid }
