import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
// import * as whatsAlf from './whats-alf'
import * as latestNextjs from './next-latest'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  //[whatsAlf.shortname]: whatsAlf.handler,
  [latestNextjs.shortname]: latestNextjs.handler,
}

export default algos
