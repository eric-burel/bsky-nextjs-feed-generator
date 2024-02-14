import { PostLabel } from './db/schema'
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

    // We are assuming computing the label again during feed generation
    // is more expensive than storing it
    // (labelling might use ML etc.)
    const labelsToCreate: Array<PostLabel> = []
    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const posts = ops.posts.creates
      // coarse-grained filtering + labelling for easier retrieval and filtering in algos
      .filter((create) => {
        const isNext = isNextjsRelated(create.record, create.author)
        const isReact = isReactjsRelated(create.record, create.author)
        if (isNext) {
          labelsToCreate.push({ label: "next", uri: create.uri })
        }
        if (isReact) {
          labelsToCreate.push({ label: "react", uri: create.uri })
        }
        return isNext || isReact
      })
    const postsToCreate = posts
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
      // remove labels
      // TODO: could use cascading rules instead?
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
    }
    // the sql query seems invalid if labelsToCreate is empty
    if (labelsToCreate.length > 0) {
      await this.db.insertInto('label')
        .values(labelsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
