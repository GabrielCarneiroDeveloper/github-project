import { Request, Response, Router } from 'express'
import { IssuesListForRepoResponseData } from '@octokit/types'

import { GithubService } from './github.service'

import logger from './../../common/logger/logger'
import { IController } from '../../interfaces/IControllers'
import { DTOController } from '../../common/dto/DTOController'
import { IssueStatesEnum } from './github.enum'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { GithubIssue, GithubRepo } from './github.models'
import { GithubFactory } from './github.factory'

interface IGithubController {
  getRepoInformation(req: Request, res: Response): Promise<Response<GithubRepo>>
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
    // this.route.get(this.baseUrl + '/owner/:owner/repo/:repo/issues', this.getRepoIssues)
  }

  getRepoInformation = async (req: Request, res: Response): Promise<Response<GithubRepo>> => {
    try {
      const { repo } = req.params
      const state = (req.query.state as IssueStatesEnum) || IssueStatesEnum.ALL

      if (!repo) {
        throw new Error('Repository name is invalid')
      }

      const response = await this.service.findRepo({ repo })
      const repositoryInformation = response.data.items[0] // the more relevant will be the first

      const owner = repositoryInformation.owner.login
      const repoName = repositoryInformation.name

      const githubRepo = await this.getGithubRepo({ owner, state, repo: repoName })

      return res.json(githubRepo)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  private async getGithubRepo({
    owner,
    repo,
    state
  }: {
    owner: string
    repo: string
    state: IssueStatesEnum
  }): Promise<GithubRepo> {
    logger.debug('Getting repo issues...')
    const githubDbRepo = getMongoRepository(GithubRepo)
    // const { owner, repo } = req.params
    // const state = (req.query.state as IssueStatesEnum) || IssueStatesEnum.ALL

    this.checkIfIssueStateIsValid(state)
    const repoIsFound = await this.checkIfRepoIsAlreadyRegistered(githubDbRepo, repo)

    const collectedIssues = await this.service
      .getRepoIssues({ owner, repo, state })
      .then(this.mapToGithubIssueList)

    const githubRepo = repoIsFound || GithubFactory({ owner, repo })
    githubRepo.issues = collectedIssues

    try {
      logger.debug('Saving Github repository in database')
      await githubDbRepo.save(githubRepo)
      logger.debug('Github repository saved in database successfully')
    } catch (error) {
      throw new Error(error.message)
    }

    return githubRepo
  }

  private async checkIfRepoIsAlreadyRegistered(
    githubDbRepo: MongoRepository<GithubRepo>,
    repo: string
  ): Promise<GithubRepo | undefined> {
    return await githubDbRepo.findOne({ where: { name: repo } })
  }

  private checkIfIssueStateIsValid(state: IssueStatesEnum): void {
    if (!Object.values(IssueStatesEnum).includes(state)) {
      throw new Error('state is invalid')
    }
  }

  private mapToGithubIssueList(data: IssuesListForRepoResponseData): GithubIssue[] {
    return data.map((issue) => new GithubIssue(issue))
  }
}
