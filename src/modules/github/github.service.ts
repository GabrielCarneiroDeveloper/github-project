import { Octokit } from '@octokit/rest'
import {
  OctokitResponse,
  IssuesListForRepoResponseData,
  SearchReposResponseData
} from '@octokit/types'

import APP_CONFIG from './../../config/app.config'

import { GetProjectInfoPayloadDTO, GetProjectIssuesDTO } from './github.dto'

import logger from './../../common/logger/logger'

export interface IGithubService {
  // getProject(data: GetProjectInfoPayloadDTO): Promise<OctokitResponse<ReposGetResponseData>>
  findRepoByName({
    repo
  }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>>
  getRepoIssues({
    owner,
    repo,
    issueState
  }: GetProjectIssuesDTO): Promise<IssuesListForRepoResponseData>
}

export class GithubService implements IGithubService {
  private github: Octokit

  constructor() {
    this.github = new Octokit({ auth: APP_CONFIG.github.accessToken })
  }

  async findRepoByName({
    repo
  }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>> {
    return this.github.search.repos({
      q: repo
    })
  }

  async getRepoIssues({
    owner,
    repo,
    issueState
  }: GetProjectIssuesDTO): Promise<IssuesListForRepoResponseData> {
    const result: IssuesListForRepoResponseData = []
    let page = 1
    let thereIsNoMoreIssues = false

    while (!thereIsNoMoreIssues) {
      const response = await this.github.issues.listForRepo({
        repo,
        owner,
        state: issueState,
        page
      })
      const currentIssuesPage = response.data

      if (currentIssuesPage.length === 0) {
        thereIsNoMoreIssues = true
      }

      logger.debug('Getting information from page ' + page)
      result.push(...currentIssuesPage)
      page++
    }
    return result
  }
}
