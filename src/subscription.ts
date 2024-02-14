import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { Record as PostRecord } from './lexicon/types/app/bsky/feed/post'

/**
 * For random posts,
 * match posts that are 100% sure related to next.js
 */
const strictNextRegExp = /next\.js|nextjs|react server comp|app router/
/**
 * For well-known authors,
 * match anything closely related to next
 */
const laxNextRegExp = /next|react|rsc|app?(\ )router|ssr|ssg|ppr|js/
const wellKnownAuthors = [
  "leerob.bsky.social",
  "danabra.mov",
]
const wellKnownDomains = [
  "vercel.com"
]
const wellKnownDomainsRegExp = new RegExp(
  wellKnownDomains
    .map(d => d.replaceAll(".", "\\."))
    .join("|"))
function isNextjsRelated(record: PostRecord, author: string) {
  const lowerRecord = record.text.toLowerCase()
  if (wellKnownAuthors.includes(author) || author.match(wellKnownDomainsRegExp)) {
    return lowerRecord.match(laxNextRegExp)
  }
  return lowerRecord.match(strictNextRegExp)
}

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    // This logs the text of every post off the firehose.
    // Just for fun :)
    // Delete before actually using
    // for (const post of ops.posts.creates) {
    //   console.log(post.record.text)
    // }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // basic logic matching Next.js or NextJS
        // this is the indexing part (= what we store in the feed's database), 
        // not the full algo 
        // =>  here we only filter relevant post
        // but do not yet select the posts we will actually render nor the order
        // see algos for the actual feed generation
        return isNextjsRelated(create.record, create.author)
      })
      .map((create) => {
        // map alf-related posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
