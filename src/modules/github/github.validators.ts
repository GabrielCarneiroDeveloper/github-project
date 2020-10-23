import Joi from 'joi'

const ProjectTrackValidator = Joi.object({
  owner: Joi.string().required().not().empty(),
  repo: Joi.string().required().not().empty()
})
export { ProjectTrackValidator }
