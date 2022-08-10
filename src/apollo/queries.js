import gql from 'graphql-tag'
import { FACTORY_ADDRESS, BUNDLE_ID } from '../constants'

export const SUBGRAPH_HEALTH = gql`
  query health {
    indexingStatusForCurrentVersion(subgraphName: "uniswap/uniswap-v2") {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`

export const V1_DATA_QUERY = gql`
  query uniswap($date: Int!, $date2: Int!) {
    current: uniswapFactories(id: "1") {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
    }
    oneDay: uniswapDayDatas(where: { timestamp_lt: $date }, first: 1, orderBy: timestamp, orderDirection: des) {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
    }
    twoDay: uniswapDayDatas(
      where: { timestamp_lt: $date2 }
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      totalVolumeUSD
      totalLiquidityUSD
      txCount
    }
    exchanges(first: 200, orderBy: ethBalance, orderDirection: des) {
      ethBalance
    }
  }
`

export const GET_BLOCK = gql`
  query getBlocks($timestampFrom: Int!, $timestampTo: Int!) {
    getBlocks(
      input: { timestampFrom: $timestampFrom, timestampTo: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query getBlocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:getBlocks(input: { timestampFrom: ${timestamp}, timestampTo: ${timestamp + 600
      } }) {
      number
    }`
  })
  queryString += '}'
  return gql(queryString)
}

export const POSITIONS_BY_BLOCK = (account, blocks) => {
  let queryString = 'query getBlocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:liquidityPositions(where: {user: "${account}"}, block: { number: ${block.number} }) { 
        liquidityTokenBalance
        pair  {
          id
          totalSupply
          reserveUSD
        }
      }
    `
  )
  queryString += '}'
  return gql(queryString)
}

export const PRICES_BY_BLOCK = (tokenAddress, blocks) => {
  let queryString = 'query getBlocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedETH
      }
    `
  )
  queryString += ','
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        ethPrice
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

export const TOP_LPS_PER_PAIRS = gql`
  query lps($pair: Bytes!) {
    liquidityPositions(where: { pair: $pair }, orderBy: liquidityTokenBalance, orderDirection: desc, first: 10) {
      user {
        id
      }
      pair {
        id
      }
      liquidityTokenBalance
    }
  }
`

export const HOURLY_PAIR_RATES = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
        token0Price
        token1Price
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

export const SHARE_VALUE = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
        reserve0
        reserve1
        reserveUSD
        totalSupply 
        token0{
          derivedETH
        }
        token1{
          derivedETH
        }
      }
    `
  )
  queryString += ','
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        ethPrice
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

export const ETH_PRICE = (block) => {
  const queryString = block
    ? `
    query getBundles {
      getBundles(input: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query getBundles {
      getBundles(input: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `
  return gql(queryString)
}

export const USER = (block, account) => {
  const queryString = `
    query users {
      user(id: "${account}", block: {number: ${block}}) {
        liquidityPositions
      }
    }
`
  return gql(queryString)
}

export const USER_MINTS_BUNRS_PER_PAIR = gql`
  query events($user: Bytes!, $pair: Bytes!) {
    mints(where: { to: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`

export const FIRST_SNAPSHOT = gql`
  query snapshots($user: Bytes!) {
    liquidityPositionSnapshots(first: 1, where: { user: $user }, orderBy: timestamp, orderDirection: "ASC") {
      timestamp
    }
  }
`

export const USER_HISTORY = gql`
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityPositionSnapshots(first: 1000, skip: $skip, where: { user: $user }) {
      timestamp
      reserveUSD
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserve0
      reserve1
      token0PriceUSD
      token1PriceUSD
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`

export const USER_POSITIONS = gql`
  query liquidityPositions($user: Bytes!) {
    liquidityPositions(where: { user: $user }) {
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
          symbol
          derivedETH
        }
        token1 {
          id
          symbol
          derivedETH
        }
        totalSupply
      }
      liquidityTokenBalance
    }
  }
`

export const USER_TRANSACTIONS = gql`
  query transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { sender: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`

export const PAIR_CHART = gql`
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: "ASC", where: { pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`

export const PAIR_DAY_DATA = gql`
  query pairDayDatas($pairAddress: Bytes!, $date: Int!) {
    pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress, date_lt: $date }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`

export const PAIR_DAY_DATA_BULK = (pairs, startTimestamp) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: "ASC", where: { pairAddress_in: ${pairsString}, date: ${startTimestamp} }) {
        id
        pairAddress
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        totalSupply
        reserveUSD
      }
    } 
`
  return gql(queryString)
}

export const GLOBAL_CHART = gql`
  query uniswapDayDatas($startTime: Int!) {
    uniswapDayDatas(input:{startTime: $startTime, orderBy: "date", orderDirection: "ASC"}) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`

export const GLOBAL_DATA = (block) => {
  const queryString = ` query uniswapFactories {
      uniswapFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       input: { id: "${FACTORY_ADDRESS}" }) {
        id
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
        txCount
        pairCount
      }
    }`
  return gql(queryString)
}

export const GLOBAL_TXNS = gql`
  query transactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      mints(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to
        liquidity
        amount0
        amount1
        amountUSD
      }
      burns(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        sender
        liquidity
        amount0
        amount1
        amountUSD
      }
      swaps(orderBy: timestamp, orderDirection: DES) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        amount0In
        amount0Out
        amount1In
        amount1Out
        amountUSD
        to
      }
    }
  }
`

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(input: {
      first: 500, skip: $skip
    }) {
      id
      name
      symbol
      totalLiquidity
    }
  }
`

export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: "totalLiquidity", orderDirection: "DES") {
      id
      symbol
      name
      totalLiquidity
    }
    asName: tokens(where: { name_contains: $value }, orderBy: "totalLiquidity", orderDirection: "DES") {
      id
      symbol
      name
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: "totalLiquidity", orderDirection: "DES") {
      id
      symbol
      name
      totalLiquidity
    }
  }
`

export const PAIR_SEARCH = gql`
  query getPairs($tokens: [String!], $id: String) {
    as0: getPairs(input: { id: $id, id_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    as1: getPairs(input: { id: $id, id_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    asAddress: getPairs(input: { id: $id, id_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`

export const ALL_PAIRS = gql`
  query getPairs($skip: Int!) {
    getPairs(input: {
      first: 500, skip: $skip, orderBy: "trackedReserveETH", orderDirection: "DES"
    }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`

const PairFields = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`

export const PAIRS_CURRENT = gql`
  query getPairs {
    getPairs(input: {
      first: 200, orderBy: "reserveUSD", orderDirection: "DES"
    }) {
      id
    }
  }
`

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query getPairs {
      getPairs(${block ? `block: {number: ${block}}` : ``} id_in: "${pairAddress}" ) {
        ...PairFields
      }
    }`
  return gql(queryString)
}

export const MINING_POSITIONS = (account) => {
  const queryString = `
    query users {
      user(id: "${account}") {
        miningPosition {
          id
          user {
            id
          }
          miningPool {
              pair {
                id
                token0
                token1
              }
          }
          balance
        }
      }
    }
`
  return gql(queryString)
}

export const PAIRS_BULK = gql`
  ${PairFields}
  query getPairs($allPairs: [String!]) {
    getPairs(input: {
      first: 500, id_in: $allPairs, orderBy: "trackedReserveETH", orderDirection: "DES"
    }) {
      ...PairFields
    }
  }
`

export const PAIRS_HISTORICAL_BULK = (block, pairs) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  let queryString = `
  query pairs {
    getPairs(input: {
      first: 200, id_in: ${pairsString}, block: {number: ${block}}, orderBy: "trackedReserveETH", orderDirection: "DES"
    }) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
    }
  }
  `
  return gql(queryString)
}

export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddress: String!) {
    tokenDayDatas(input: {orderBy: "date", orderDirection: "ASC", tokenAddress: $tokenAddress}) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`

// used for getting top tokens by daily volume
export const TOKEN_TOP_DAY_DATAS = gql`
  query tokenDayDatas($date: Int) {
    tokenDayDatas(input: {orderBy: "totalLiquidityUSD", orderDirection: "DES", date: $date}) {
      id
      date
    }
  }
`

export const TOKENS_BULK = gql`
  ${TokenFields}
  query tokens($tokenAddresses: [String]!) {
    getPairs(input: { id_in: $tokenAddresses }) {
      ...TokenFields
    }
  }
`
export const TOKENS_HISTORICAL_BULK = (tokens, block) => {
  let tokenString = `[`
  tokens.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  let queryString = `
  query tokens {
    tokens(input: {
      first: 50, id_in: ${tokenString}}, ${block ? 'block: {number: ' + block + '}' : ''}  ) {
      id
      name
      symbol
      derivedETH
      tradeVolume
      tradeVolumeUSD
      untrackedVolumeUSD
      totalLiquidity
      txCount
    }
  }
  `
  return gql(queryString)
}

export const TOKENS_CURRENT = gql`
  ${TokenFields}
  query tokens {
    tokens(input: {
      first: 200, orderBy: "tradeVolumeUSD", orderDirection: "DES"
    }) {
      ...TokenFields
    }
  }
`

export const TOKENS_DYNAMIC = (block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 200, orderBy: "tradeVolumeUSD", orderDirection: "DES") {
        ...TokenFields
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(input: {
        ${block ? `block : {number: ${block}}` : ``} id_in:"${tokenAddress}"}
      }) {
        ...TokenFields
      }
      pairs0: getPairs(input: {
        id_in: "${tokenAddress}", first: 50, orderBy: "reserveUSD", orderDirection: "DES"
      }){
        id
      }
      pairs1: getPairs(input: {
        id_in: "${tokenAddress}"}, first: 50, orderBy: "reserveUSD", orderDirection: "DES"
      }){
        id
      }
    }
  `
  return gql(queryString)
}

export const FILTERED_TRANSACTIONS = gql`
  query ($allPairs: [Bytes]!) {
    mints(first: 20, where: { pair_in: $allPairs }, orderBy: "timestamp", orderDirection: "DES") {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(first: 20, where: { pair_in: $allPairs }, orderBy: "timestamp", orderDirection: "DES") {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`