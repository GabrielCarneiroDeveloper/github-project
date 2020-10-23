import { Octokit } from '@octokit/rest'
import {
  OctokitResponse,
  IssuesListForRepoResponseData,
  SearchReposResponseData
} from '@octokit/types'
import { GetProjectInfoPayloadDTO, GetProjectIssuesDTO } from './github.dto'
import logger from './../../common/logger/logger'
import APP_CONFIG from '@src/config/app.config'

export interface IGithubService {
  // getProject(data: GetProjectInfoPayloadDTO): Promise<OctokitResponse<ReposGetResponseData>>
  findRepo({ repo }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>>
  getRepoIssues({ owner, repo, state }: GetProjectIssuesDTO): Promise<IssuesListForRepoResponseData>
}

export class GithubService implements IGithubService {
  private github: Octokit

  constructor() {
    this.github = new Octokit({ auth: APP_CONFIG.githubAccessToken })
  }

  findRepo({ repo }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>> {
    return this.github.search.repos({
      q: repo
    })
  }

  async getRepoIssues({
    owner,
    repo,
    state
  }: GetProjectIssuesDTO): Promise<IssuesListForRepoResponseData> {
    logger.debug('Service will get issues from Github Api')
    const openedIssuesList: IssuesListForRepoResponseData = []
    let page = 1
    let thereIsNoMoreOpenedIssues = false

    while (thereIsNoMoreOpenedIssues === false) {
      logger.debug(`Getting "${state}" issues from page number ${page}`)
      const response = await this.github.issues.listForRepo({
        owner,
        repo,
        state,
        page
      })
      const currentPageOpenedIssues = response.data

      if (currentPageOpenedIssues.length === 0) {
        logger.debug('All issues have been collected.')
        thereIsNoMoreOpenedIssues = true
      } else {
        openedIssuesList.push(...currentPageOpenedIssues)
        page++
      }
    }
    return openedIssuesList
  }
}
