import buildTransformer from '@znaaron/simple-ts-transform'
import YtContext from './YupType.Context'
import { DFAVisitor } from './YupType.NodeVisitors'

const transformer = buildTransformer(YtContext, [DFAVisitor])
export default transformer