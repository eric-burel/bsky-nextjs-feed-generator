export type DatabaseSchema = {
  post: Post
  sub_state: SubState
  label: PostLabel
}

export type Post = {
  uri: string
  cid: string
  replyParent: string | null
  replyRoot: string | null
  indexedAt: string
}

export type PostLabel = {
  uri: string,
  // add labels as needed here
  label: "react" | "next"
}

export type SubState = {
  service: string
  cursor: number
}
