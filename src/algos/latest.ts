import { InvalidRequestError } from '@atproto/xrpc-server'
import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'
import { PostLabel } from '../db/schema'

// max 15 chars
export const shortname = 'whats-reactjs'

/**
 * Will filter posts based on an indexed label
 * and show them in reverse chronological order
 * @param ctx 
 * @param params 
 * @returns 
 */
export const latestMatchingLabelHandler = (label: PostLabel["label"]) => async (ctx: AppContext, params: QueryParams) => {
  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    // match posts with next.js label
    .whereExists((qb) => qb.selectFrom('label').selectAll().whereRef("label.uri", "=", "post.uri").where("label.label", "=", label))
    .limit(params.limit)

  if (params.cursor) {
    const [indexedAt, cid] = params.cursor.split('::')
    if (!indexedAt || !cid) {
      throw new InvalidRequestError('malformed cursor')
    }
    const timeStr = new Date(parseInt(indexedAt, 10)).toISOString()
    builder = builder
      .where('post.indexedAt', '<', timeStr)
      .orWhere((qb) => qb.where('post.indexedAt', '=', timeStr))
      .where('post.cid', '<', cid)
  }
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(builder.compile())
    }
    const res = await builder.execute()

    const feed = res.map((row) => ({
      post: row.uri,
    }))

    let cursor: string | undefined
    const last = res.at(-1)
    if (last) {
      cursor = `${new Date(last.indexedAt).getTime()}::${last.cid}`
    }

    return {
      cursor,
      feed,
    }
  } catch (err) {
    console.error("Couldn't get data from handler", label, err)
    throw err
  }
}
