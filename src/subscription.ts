import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { isNextjsRelated, isReactjsRelated } from './matcher'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'


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
    const nextPosts = ops.posts.creates
      .filter((create) => {
        // basic logic matching Next.js or NextJS
        // this is the indexing part (= what we store in the feed's database), 
        // not the full algo 
        // =>  here we only filter relevant post
        // but do not yet select the posts we will actually render nor the order
        // see algos for the actual feed generation
        return isNextjsRelated(create.record, create.author)
      })
    const reactPosts = ops.posts.creates
      .filter((create) => {
        return isReactjsRelated(create.record, create.author)
      })
    //|| isReactjsRelated(create.record, create.author)
    const postsToCreate = [...nextPosts, ...reactPosts]
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
    // We are assuming computing the label again during feed generation
    // is more expensive than storing it
    // (labelling might use ML etc.)
    const labelsToCreate = [
      ...nextPosts.map(create => ({ uri: create.uri, label: "next" })),
      ...reactPosts.map(create => ({ uri: create.uri, label: "react" }))
    ]

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
      await this.db
        .deleteFrom('label')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
      await this.db.insertInto('label')
        .values(labelsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
