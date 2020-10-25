import { Request, response, Response, Router } from 'express'
import { IssuesListForRepoResponseData } from '@octokit/types'

import { GithubService } from './github.service'

import logger from './../../common/logger/logger'
import { IController } from '../../interfaces/IControllers'
import { DTOController } from '../../common/dto/DTOController'
import { IssueStatesEnum } from './github.enum'
import { getMongoRepository, MongoRepository } from 'typeorm'
import { GithubIssue, GithubRepo } from './github.models'
import { GithubFactory, GithubIssueFactory } from './github.factory'
import APP_CONFIG from '@src/config/app.config'

interface GetRepoIssuesRouteResponse {
  total: number
  page: number
  data: GithubIssue[]
}

interface IGithubController {
  getRepoInformation(req: Request, res: Response): Promise<Response<GithubRepo>>
  getRepoIssues(req: Request, res: Response): Promise<Response<GetRepoIssuesRouteResponse>>
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
    this.route.get(this.baseUrl + '/repo/:owner/:repo/issues', this.getRepoIssues)
    this.route.put(this.baseUrl + '/repo/:owner/:repo', this.updateRepoIssueList)
  }

  getRepoInformation = async (req: Request, res: Response): Promise<Response<GithubRepo>> => {
    // get data from request
    const { repo } = req.params
    const issueState = (req.query.issue_state as IssueStatesEnum) || IssueStatesEnum.ALL

    // declare mongo repositories
    const githubDbRepo = getMongoRepository(GithubRepo)
    const githubIssueDbRepo = getMongoRepository(GithubIssue)

    if (!repo) {
      throw new Error('Repository name is invalid')
    }

    try {
      // check if repository already exists in database
      const repoIsAlreadyRegistered = await this.checkIfRepoIsAlreadyRegistered(githubDbRepo, repo)

      if (repoIsAlreadyRegistered) {
        return res.json(repoIsAlreadyRegistered)
      }

      // get repository information from Github
      logger.debug('Getting general repository information')
      const generalRepoInformation = await this.service
        .findRepoByName({ repo })
        .then((response) => {
          const allReturnedRepo = response.data.items.filter((r) => r.name === repo)
          const mostRelevant = allReturnedRepo[0]
          return mostRelevant
        }) // select the more relevant. It will be the first

      if (!generalRepoInformation) {
        throw new Error('Requested repository is not classified as a relevant project')
      }

      // register repository in database primaryli
      const owner = generalRepoInformation.owner.login
      const repoName = generalRepoInformation.name
      const repositoryUrl = this.getRepositoryUrl({ owner, repo: repoName })

      logger.debug('Pre registering repo', repo)
      const githubRepo = GithubFactory({
        owner,
        repo: repoName,
        repositoryUrl
      })
      logger.debug('Pre registered successfully')

      // get repository issues from Github
      logger.debug('Getting repository issue list with status ' + issueState.valueOf())
      const githubRepoIssueList = await this.getGithubRepoIssuesList({
        owner,
        issueState,
        repo: repoName
      }).then(this.mapToGithubIssueList)
      logger.debug('Requested repository issue list successfully fetched')

      githubRepo.quantity_of_opened_issues = githubRepoIssueList.length
      // save issues in repository database register
      const registeredGithubRepo = await githubDbRepo.save(githubRepo)
      await githubIssueDbRepo.insertMany(githubRepoIssueList)

      return res.json(registeredGithubRepo)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  getRepoIssues = async (
    req: Request,
    res: Response
  ): Promise<Response<GetRepoIssuesRouteResponse>> => {
    try {
      const { owner, repo } = req.params
      const repositoryUrl = this.getRepositoryUrl({ owner, repo })
      const issueState = (req.query.issue_state as IssueStatesEnum) || IssueStatesEnum.ALL
      const issuesPerPage = 30 // it will be fix for now
      let page = 1
      if (req.query.page) {
        if (typeof req.query.page === 'object') {
          page = parseInt(req.query.page[0])
        } else {
          page = parseInt(req.query.page)
        }
      }

      if (!repo || !owner) {
        throw new Error('Requested repository data is invalid or not provided')
      }

      // declare mongo repositories
      const githubDbRepo = getMongoRepository(GithubRepo)
      const githubIssueDbRepo = getMongoRepository(GithubIssue)

      const totalRegisteredIssues = await githubDbRepo
        .findOneOrFail({
          where: { owner, name: repo }
        })
        .then((response) => response.quantity_of_opened_issues)

      const issuesList = await githubIssueDbRepo.find({
        where: {
          repository_url: repositoryUrl,
          state: issueState
        },
        skip: page > 0 ? (page - 1) * issuesPerPage : 0,
        take: issuesPerPage
      })

      if (issuesList.length === 0) {
        throw new Error('Page not found')
      }

      return res.json({
        total: totalRegisteredIssues,
        page: page,
        data: issuesList
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  updateRepoIssueList = async (req: Request, res: Response): Promise<Response<any>> => {
    try {
      const { owner, repo } = req.params
      const repositoryUrl = this.getRepositoryUrl({ owner, repo })
      const issueState = (req.query.issue_state as IssueStatesEnum) || IssueStatesEnum.ALL

      if (!repo || !owner) {
        throw new Error('Requested repository data is invalid or not provided')
      }

      // declare mongo repositories
      const githubDbRepo = getMongoRepository(GithubRepo)
      const githubIssueDbRepo = getMongoRepository(GithubIssue)

      const githubRepo = await githubDbRepo.findOneOrFail({
        where: { name: repo, owner }
      })

      const issueList = await this.service
        .getRepoIssues({ owner, repo, issueState })
        .then(this.mapToGithubIssueList)

      /**
       * TODO: apagar todas as issues desse projeto do banco e depois incluir todas novamente (onde a maioria eh duplicidade)
       * eh computacionalmente muuuuito caro. O correto é em tempo de execucao, eliminar a duplicidade, atualizar
       * o status das issues que mudaram de 'open' para 'closed' e adicionar as novas 'open' issues.
       * Fica como melhoria do processo.
       */

      logger.debug('Removing project ' + repo + ' issues')
      const projectIssuesWasDeleted = await githubIssueDbRepo.deleteMany({
        repository_url: this.getRepositoryUrl({ owner: githubRepo.owner, repo: githubRepo.name })
      })

      logger.debug('Updating project ' + repo + ' issues list')
      if (projectIssuesWasDeleted.deletedCount && projectIssuesWasDeleted.deletedCount > 0) {
        await githubIssueDbRepo.insertMany(issueList)
      }

      logger.debug('Updating project ' + repo + ' quantity of registered issues')
      githubRepo.quantity_of_opened_issues = issueList.length
      const updated = await githubDbRepo.save(githubRepo)

      return res.json(updated)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  private uniqBy(a: any[], key: CallableFunction) {
    return [...new Map(a.map((x: any) => [key(x), x])).values()]
  }

  private async getGithubRepoIssuesList({
    owner,
    repo,
    issueState
  }: {
    owner: string
    repo: string
    issueState: IssueStatesEnum
  }): Promise<IssuesListForRepoResponseData> {
    logger.debug('Getting repo information from Github...')
    const issuesList = await this.service.getRepoIssues({ owner, repo, issueState })
    return issuesList
  }

  private async saveGithubRepoInDatabase({
    githubDbRepo,
    githubRepo
  }: {
    githubDbRepo: MongoRepository<GithubRepo>
    githubRepo: GithubRepo
  }): Promise<GithubRepo> {
    try {
      logger.debug('Saving Github repository in database')
      const registered = await githubDbRepo.save(githubRepo)
      logger.debug('Github repository saved in database successfully')
      return registered
    } catch (error) {
      throw new Error(error.message)
    }
  }

  private async checkIfRepoIsAlreadyRegistered(
    githubDbRepo: MongoRepository<GithubRepo>,
    repo: string
  ): Promise<GithubRepo | undefined> {
    return githubDbRepo.findOne({ where: { name: repo } })
  }

  private mapToGithubIssueList(data: IssuesListForRepoResponseData): GithubIssue[] {
    return data.map((issue) => GithubIssueFactory(issue))
  }

  private getRepositoryUrl({ owner, repo }: { owner: string; repo: string }): string {
    return `${APP_CONFIG.github.baseUrl}/repos/${owner}/${repo}`
  }
}
