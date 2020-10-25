/* eslint-disable */
interface GithubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

interface GithubLabel {
  id: number
  node_id: string
  url: string
  name: string
  description: string
  color: string
  default: boolean
}

interface GithubMilestone {
  url: string
  html_url: string
  labels_url: string
  id: number
  node_id: string
  number: number
  state: string
  title: string
  description: string
  creator: GithubUser
  open_issues: number
  closed_issues: number
  created_at: string
  updated_at: string
  closed_at: string
  due_on: string
}

interface GithubPullRequest {
  url: string
  html_url: string
  diff_url: string
  patch_url: string
}
/* eslint-enable */

export { GithubUser, GithubLabel, GithubMilestone, GithubPullRequest }
