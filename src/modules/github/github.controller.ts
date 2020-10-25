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

  // getRepoFromDatabase = async (req: Request, res: Response): Promise<Response<GithubRepo>> => {
  //   try {
  //     const { repo } = req.params
  //     const issueState = (req.query.issue_state as IssueStatesEnum) || IssueStatesEnum.ALL
  //     const githubDbRepo = getMongoRepository(GithubRepo)
  //     return res.json('asdfasdf')
  //   } catch (error) {
  //     logger.error(error.message)
  //     return res.status(401).send({ message: error.message })
  //   }
  // }

  getRepoInformation = async (req: Request, res: Response): Promise<Response<GithubRepo>> => {
    try {
      const { repo } = req.params
      const issueState = (req.query.issue_state as IssueStatesEnum) || IssueStatesEnum.ALL
      const githubDbRepo = getMongoRepository(GithubRepo)

      if (!repo) {
        throw new Error('Repository name is invalid')
      }

      const repoIsAlreadyRegistered = await githubDbRepo.findOne({ where: { name: repo } })
      if (repoIsAlreadyRegistered) {
        return res.json(repoIsAlreadyRegistered)
      }

      logger.debug('Getting general repository information')
      const generalRepoInformation = await this.service
        .findRepoByName({ repo })
        .then((response) => {
          const allReturnedRepo = response.data.items.filter((r) => r.name === repo)
          const mostRelevant = allReturnedRepo[0]
          return mostRelevant
        }) // the more relevant will be the first

      if (!generalRepoInformation) {
        throw new Error('Requested repository is not classified as a relevant project')
      }

      const owner = generalRepoInformation.owner.login
      const repoName = generalRepoInformation.name

      logger.debug('Pre registering repo', repo)
      try {
        const githubRepoPreRegister = GithubFactory({
          owner,
          repo: repoName
        })
        await githubDbRepo.save(githubRepoPreRegister)
        logger.debug('Pre registered successfully')
      } catch (error) {
        throw new Error(error.message)
      }

      logger.debug('Getting full repository information')
      const result = await this.getGithubRepoIssuesList({
        owner,
        issueState,
        repo: repoName
      })

      // TODO: Github repo should be saved in database from here, not service

      // if (!result.id) {
      //   this.saveGithubRepoInDatabase({ githubDbRepo, githubRepo: result })
      // }

      return res.json(result)
    } catch (error) {
      logger.error(error.message)
      return res.status(401).send({ message: error.message })
    }
  }

  private async getGithubRepoIssuesList({
    owner,
    repo,
    issueState
  }: {
    owner: string
    repo: string
    issueState: IssueStatesEnum
  }): Promise<GithubRepo> {
    logger.debug('Getting repo information from Github...')

    // TODO: Github project initial information should be returned by .getRepoissues()
    const githubRepo = await this.service.getRepoIssues({ owner, repo, issueState })

    // const githubRepo = GithubFactory({ owner, repo })
    // githubRepo.issues = collectedIssues

    return githubRepo
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
    return await githubDbRepo.findOne({ where: { name: repo } })
  }

  private checkIfIssueStateIsValid(issueState: IssueStatesEnum): void {
    if (!Object.values(IssueStatesEnum).includes(issueState)) {
      throw new Error('issueState is invalid')
    }
  }

  private mapToGithubIssueList(data: IssuesListForRepoResponseData): GithubIssue[] {
    return data.map((issue) => new GithubIssue(issue))
  }
}
