import { Request, Response, Router } from 'express'
import { ReposGetResponseData } from '@octokit/types'

import { checkIfIssueStateIsValid } from './github.validators'
import { GithubService } from './github.service'

import logger from './../../common/logger/logger'
import { IController } from '../../interfaces/IControllers'
import { DTOController } from '../../common/dto/DTOController'
import { IssueStatesEnum } from './github.enum'

interface IGithubController {
  getRepoInformation(req: Request, res: Response): Promise<Response<ReposGetResponseData>>

  getRepoIssues(req: Request, res: Response): Promise<Response<any>>
}

export class GithubController implements IController, IGithubController {
  route: Router
  service: GithubService
  baseUrl: string

  constructor({ route }: DTOController) {
    this.route = route
    this.baseUrl = '/libquality/v1/github'
    this.service = new GithubService()
  }

  async init(): Promise<void> {
    this.route.get(this.baseUrl + '/repo/:repo', this.getRepoInformation)
    this.route.get(this.baseUrl + '/owner/:owner/repo/:repo/issues', this.getRepoIssues)
  }

  getRepoInformation = async (
    req: Request,
    res: Response
  ): Promise<Response<ReposGetResponseData>> => {
    try {
      const { repo } = req.params
      if (!repo) {
        throw new Error('Repository name is invalid')
      }

      const response = await this.service.findRepo({ repo })
      const repositoryInformation = response.data.items[0] // the more relevant will be the first

      const owner = repositoryInformation.owner.login
      const repoName = repositoryInformation.name

      const openedIssues = await this.service
        .getRepoIssues({
          repo: repoName,
          owner,
          state: IssueStatesEnum.OPEN
        })
        .then((response) => response.data)

      const openedIssuesCount = openedIssues.length

      console.log(openedIssuesCount)

      return res.json(repositoryInformation)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  // to development
  getRepoIssues = async (req: Request, res: Response): Promise<Response<ReposGetResponseData>> => {
    try {
      const { owner, repo } = req.params
      const state = (req.query.state as IssueStatesEnum) || IssueStatesEnum.ALL
      checkIfIssueStateIsValid(state)

      const response = await this.service.getRepoIssues({
        owner,
        repo,
        state: state
      })
      const repoIssues = response.data

      return res.json(repoIssues)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }
}
