import { Column, Entity, ObjectIdColumn } from 'typeorm'
import { GithubLabel, GithubMilestone, GithubPullRequest, GithubUser } from './github.interface'

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
  repository_url: string

  @Column()
  quantity_of_opened_issues: number

  constructor(owner: string, name: string, repositoryUrl: string) {
    this.owner = owner
    this.name = name
    this.repository_url = repositoryUrl
  }
}

@Entity()
class GithubIssue {
  @ObjectIdColumn()
  _id: string

  @Column()
  id: number

  @Column()
  node_id: string

  @Column()
  url: string

  @Column()
  repository_url: string

  @Column()
  labels_url: string

  @Column()
  comments_url: string

  @Column()
  events_url: string

  @Column()
  html_url: string

  @Column()
  number: number

  @Column()
  state: string

  @Column()
  title: string

  @Column()
  body: string

  @Column()
  user: GithubUser

  @Column()
  labels: GithubLabel[]

  @Column()
  assignee: GithubUser

  @Column()
  assignees: GithubUser[]

  @Column()
  milestone: GithubMilestone

  @Column()
  locked: boolean

  @Column()
  active_lock_reason: string

  @Column()
  comments: number

  @Column()
  pull_request: GithubPullRequest

  @Column()
  closed_at: string

  @Column()
  created_at: string

  @Column()
  updated_at: string

  constructor(
    id: number,
    node_id: string,
    url: string,
    repository_url: string,
    labels_url: string,
    comments_url: string,
    events_url: string,
    html_url: string,
    number: number,
    state: string,
    title: string,
    body: string,
    user: GithubUser,
    labels: GithubLabel[],
    assignee: GithubUser,
    assignees: GithubUser[],
    milestone: GithubMilestone,
    locked: boolean,
    active_lock_reason: string,
    comments: number,
    pull_request: GithubPullRequest,
    closed_at: string,
    created_at: string,
    updated_at: string
  ) {
    this.id = id
    this.node_id = node_id
    this.url = url
    this.repository_url = repository_url
    this.labels_url = labels_url
    this.comments_url = comments_url
    this.events_url = events_url
    this.html_url = html_url
    this.number = number
    this.state = state
    this.title = title
    this.body = body
    this.user = user
    this.labels = labels
    this.assignee = assignee
    this.assignees = assignees
    this.milestone = milestone
    this.locked = locked
    this.active_lock_reason = active_lock_reason
    this.comments = comments
    this.pull_request = pull_request
    this.closed_at = closed_at
    this.created_at = created_at
    this.updated_at = updated_at
  }
}

/* eslint-enable */

export { GithubIssue, GithubRepo }
