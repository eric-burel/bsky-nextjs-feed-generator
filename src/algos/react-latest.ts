import { InvalidRequestError } from '@atproto/xrpc-server'
// import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
// import { AppContext } from '../config'
import { latestMatchingLabelHandler } from './latest'

// max 15 chars
export const shortname = 'whats-reactjs'

export const handler = latestMatchingLabelHandler("react")