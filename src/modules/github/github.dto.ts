import { IssueStatesEnum } from './github.enum'

interface GetProjectInfoPayloadDTO {
  repo: string
}

interface GetProjectIssuesDTO {
  owner: string
  repo: string
  state: IssueStatesEnum
}

export { GetProjectInfoPayloadDTO, GetProjectIssuesDTO }
