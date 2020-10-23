import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity()
class GithubRepo {
  @ObjectIdColumn()
  id: number

  @Column()
  name: string

  @Column()
  issues: GithubIssue[]
}

/* eslint-disable */
class GithubIssue {

  id: number
  node_id: string
  url: string
  number: number
  state: string
  title: string
  body: string
  comments: number
  closed_at: string
  created_at: string
  updated_at: string

  constructor(payload: { 
    id: number
    node_id: string
    url: string
    number: number
    state: string
    title: string
    body: string
    comments: number
    closed_at: string
    created_at: string
    updated_at: string
  }) {
    this.id = payload.id
    this.node_id = payload.node_id
    this.url = payload.url
    this.number = payload.number
    this.state = payload.state
    this.title = payload.title
    this.body = payload.body
    this.comments = payload.comments
    this.closed_at = payload.closed_at
    this.created_at = payload.created_at
    this.updated_at = payload.updated_at
  }
}
/* eslint-enable */

export { GithubIssue, GithubRepo }
