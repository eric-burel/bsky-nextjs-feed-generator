import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
// import * as whatsAlf from './whats-alf'
import * as latestNextjs from './next-latest'
import * as latestReactjs from './react-latest'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  //[whatsAlf.shortname]: whatsAlf.handler,
  [latestNextjs.shortname]: latestNextjs.handler,
  // TODO: not sure yet how algos are handled
  // we may want having 2 feeds instead here?
  // [latestReactjs.shortname]: latestReactjs.handler,
}

export default algos
