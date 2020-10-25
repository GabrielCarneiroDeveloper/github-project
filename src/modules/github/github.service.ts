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

  async getRepoIssues({ owner, repo, issueState }: GetProjectIssuesDTO): Promise<any> {
    logger.debug('Service will get issues from Github Api')

    const githubDbRepo = getRepository(GithubRepo)
    const githubFound = await githubDbRepo.findOneOrFail({ where: { name: repo } })

    const result: any[][] = []
    const sizeLimitInMbToEachRow = 1 // Mb
    let temp: any[] = []
    let page = 1
    let thereIsNoMoreIssues = false

    while (!thereIsNoMoreIssues) {
      logger.debug(`Getting "${issueState}" issues from page number ${page}`)
      const response = await this.github.issues.listForRepo({
        owner,
        repo,
        issueState,
        page
      })
      const currentIssuesPage = response.data
      /*
       * se o retorno for um array vazio, nao existem mais issues para serem pegas.
       * nesse vamos adicionar o temp em result e finalizar o processo.
       */
      if (currentIssuesPage.length === 0) {
        // result.push(temp)
        githubFound.issues.push(...temp)
        await githubDbRepo.save(githubFound)
        logger.debug(`repository ${repo} issues list updated`)
        thereIsNoMoreIssues = true
      }

      /*
       * se o temp alcancou o limite de memória estipulado, vamos:
       * - adicinar o temp em result
       * - zerar temp
       * - adicionar as issues da pagina atual no temp zerado para que o loop continue e evite redundancias
       *
       * Nesse passo o interessante eh salvar temp diretamente no repo no banco de dados
       */
      if (memorySizeOf(temp) >= sizeLimitInMbToEachRow) {
        logger.debug('row ', result.length, 'reached the limit')
        logger.debug(
          'issues from page ' + page + ' will be stored in row ' + (result.length + 1) + '\n'
        )
        // result.push(temp)

        // salvar temp no banco de dados
        githubFound.issues.push(...temp)
        await githubDbRepo.save(githubFound)
        logger.debug(`repository ${repo} issues list updated`)

        temp = []
        temp.push(currentIssuesPage)
      } else {
        // se o limite de memoria do temp ainda nao foi alcancado, adicionamos as issues da pagina atual em temp
        logger.debug('populating row', result.length)
        temp.push(...currentIssuesPage)
      }
      // await sleep(3000)
      page++
    }
    return githubFound
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
