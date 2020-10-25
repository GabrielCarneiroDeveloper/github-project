import { GithubLabel, GithubMilestone, GithubPullRequest, GithubUser } from './github.interface'
import { GithubIssue, GithubRepo } from './github.models'

/* eslint-disable */
function GithubFactory(payload: {
  owner: string
  repo: string
  repositoryUrl: string
}): GithubRepo {
  const githubRepo = new GithubRepo(payload.owner, payload.repo, payload.repositoryUrl)
  return githubRepo
}

function GithubIssueFactory(payload: {
  id: number
  node_id: string
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  number: number
  state: string
  title: string
  body: string
  user: GithubUser
  labels: GithubLabel[]
  assignee: GithubUser
  assignees: GithubUser[]
  milestone: GithubMilestone
  locked: boolean
  active_lock_reason: string
  comments: number
  pull_request: GithubPullRequest
  closed_at: string
  created_at: string
  updated_at: string
}): GithubIssue {
  const githubIssue = new GithubIssue(
    payload.id,
    payload.node_id,
    payload.url,
    payload.repository_url,
    payload.labels_url,
    payload.comments_url,
    payload.events_url,
    payload.html_url,
    payload.number,
    payload.state,
    payload.title,
    payload.body,
    payload.user,
    payload.labels,
    payload.assignee,
    payload.assignees,
    payload.milestone,
    payload.locked,
    payload.active_lock_reason,
    payload.comments,
    payload.pull_request,
    payload.closed_at,
    payload.created_at,
    payload.updated_at
  )
  return githubIssue
}
/* eslint-enable */

export { GithubFactory, GithubIssueFactory }
