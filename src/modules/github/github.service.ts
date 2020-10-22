import { Octokit } from '@octokit/rest'
import {
  OctokitResponse,
  IssuesListForRepoResponseData,
  SearchReposResponseData
} from '@octokit/types'
import { GetProjectInfoPayloadDTO, GetProjectIssuesDTO } from './github.dto'

export interface IGithubService {
  // getProject(data: GetProjectInfoPayloadDTO): Promise<OctokitResponse<ReposGetResponseData>>
  findRepo({ repo }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>>
  getRepoIssues({
    owner,
    repo,
    state
  }: GetProjectIssuesDTO): Promise<OctokitResponse<IssuesListForRepoResponseData>>
}

export class GithubService implements IGithubService {
  private github: Octokit

  constructor() {
    this.github = new Octokit()
  }

  findRepo({ repo }: GetProjectInfoPayloadDTO): Promise<OctokitResponse<SearchReposResponseData>> {
    return this.github.search.repos({
      q: repo
    })
  }

  getRepoIssues({
    owner,
    repo,
    state
  }: GetProjectIssuesDTO): Promise<OctokitResponse<IssuesListForRepoResponseData>> {
    return this.github.issues.listForRepo({
      owner,
      repo,
      state
    })
  }
}
