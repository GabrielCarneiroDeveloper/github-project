import { Octokit } from '@octokit/rest'
import {
  OctokitResponse,
  IssuesListForRepoResponseData,
  SearchReposResponseData
} from '@octokit/types'
import { GetProjectInfoPayloadDTO, GetProjectIssuesDTO } from './github.dto'
import logger from './../../common/logger/logger'
import APP_CONFIG from '@src/config/app.config'
import { GithubIssue, GithubRepo } from './github.models'
import { getRepository } from 'typeorm'

function memorySizeOf(obj: any): number {
  let bytes = 0

  function sizeOf(obj: any) {
    if (obj !== null && obj !== undefined) {
      const objClass = Object.prototype.toString.call(obj).slice(8, -1)
      if (objClass === 'Object' || objClass === 'Array') {
        for (const key in obj) {
          if (!Object.hasOwnProperty.call(obj, key)) continue
          sizeOf(obj[key])
        }
      } else bytes += obj.toString().length * 2
    }
    return bytes
  }

  function formatByteSize(bytes: number) {
    return parseFloat((bytes / 1048576).toFixed(3))
  }

  return formatByteSize(sizeOf(obj))
}

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
    if (APP_CONFIG.githubAccessToken) {
      logger.info(
        'Github personal access token is configured. You are configured as signed in user.'
      )
    } else {
      logger.warn(
        'Github personal access token NOT PROVIDED. You are configured as signed out user'
      )
    }
    this.github = new Octokit({ auth: APP_CONFIG.githubAccessToken })
  }

  findRepoByName({
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
