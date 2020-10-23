import { GithubRepo } from './github.models'

function GithubFactory(payload: { owner: string; repo: string }): GithubRepo {
  const githubRepo = new GithubRepo(payload.owner, payload.repo)
  return githubRepo
}

export { GithubFactory }
