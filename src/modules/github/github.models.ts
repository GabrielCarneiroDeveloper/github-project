import { Column, Entity, ObjectIdColumn } from 'typeorm'

/* eslint-disable */
@Entity()
class GithubRepo {
  @ObjectIdColumn()
  id: number

  @Column()
  name: string

  @Column()
  owner: string

  @Column()
  issues: GithubIssue[]

  constructor(owner: string, name: string) {
    this.owner = owner
    this.name = name
    this.issues = []
  }
}

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
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string;
  color: string;
  default: boolean;
} 

interface GithubMilestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  state: string;
  title: string;
  description: string;
  creator: GithubUser;
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  closed_at: string;
  due_on: string;
}

interface GithubPullRequest {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

class GithubIssue {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: GithubUser;
  labels: GithubLabel[];
  assignee: GithubUser
  assignees: GithubUser[];
  milestone: GithubMilestone;
  locked: boolean;
  active_lock_reason: string;
  comments: number;
  pull_request: GithubPullRequest;
  closed_at: string;
  created_at: string;
  updated_at: string;

  constructor(payload: { 
    id: number;
    node_id: string;
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    number: number;
    state: string;
    title: string;
    body: string;
    user: GithubUser;
    labels: GithubLabel[];
    assignee: GithubUser
    assignees: GithubUser[];
    milestone: GithubMilestone;
    locked: boolean;
    active_lock_reason: string;
    comments: number;
    pull_request: GithubPullRequest;
    closed_at: string;
    created_at: string;
    updated_at: string;
  }) {
    this.id = payload.id
    this.node_id = payload.node_id
    this.url = payload.url
    this.repository_url = payload.repository_url
    this.labels_url = payload.labels_url
    this.comments_url = payload.comments_url
    this.events_url = payload.events_url
    this.html_url = payload.html_url
    this.number = payload.number
    this.state = payload.state
    this.title = payload.title
    this.body = payload.body
    this.user = payload.user
    this.labels = payload.labels
    this.assignee = payload.assignee
    this.assignees = payload.assignees
    this.milestone = payload.milestone
    this.locked = payload.locked
    this.active_lock_reason = payload.active_lock_reason
    this.comments = payload.comments
    this.pull_request = payload.pull_request
    this.closed_at = payload.closed_at
    this.created_at = payload.created_at
    this.updated_at = payload.updated_at
  }
}
/* eslint-enable */

export { GithubIssue, GithubRepo }
