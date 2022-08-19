import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { formatTime, formattedNum, urls } from '../../utils'
import { useMedia } from 'react-use'
import { useCurrentCurrency } from '../../contexts/Application'
import { RowFixed, RowBetween } from '../Row'

import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import { CustomLink } from '../Link'

import { Divider, EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { updateNameData } from '../../utils/data'
import { TextDecoder } from 'util'

dayjs.extend(utc)

const Table = styled.table`
  border: none;
  border: #06fc99 solid 1px;
  box-shadow: 0px 0px 10px #94ffb241;
  margin: 5px auto;
  color: #06fc99;
  width: calc(100% - 10px);
  text-align: center;
  border-collapse: collapse;
  border-spacing: 0;
  text-shadow: none;
  thead {
    text-transform: lowercase;
    font-size: 14px;
    background-color: #06fc9a1b;
  }

  th {
    padding: 8px;
    font-weight: 400;
    line-height: 1rem;
  }

  tr {
    font-size: 14px;
    font-weight: 400;
    line-height: 4rem;
    background-color: black;
    border-bottom: #06fc99 solid 1px;
  }
  td:first-child,
  th:first-child {
    padding-left: 2rem;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-transform: uppercase;
  }
  th:first-child {
    text-transform: lowercase;
  }
  img {
    height: 30px;
    /* width: 30px; */
    /* border-radius: 50%; */
    /* border: 1px solid #06fc99; */
    /* background-color: #cecece; */
  }
  tbody {
    border: #06fc99 solid 1px;

    tr:hover {
      background-color: #14392a;
      cursor: pointer;
    }
  }
  @media (max-width: 1000px) {
    width: 800px;
    margin: 0 2rem;
  }
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: rgb(238, 75, 43);
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'txn value time';

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 500px) {
    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }
`

const ClickableText = styled(Text)`
  user-select: none;
  text-align: center;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

const SortText = styled.button`
  cursor: pointer;
  font-family: IBM Plex Mono, monospace;
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  padding: 0px;
  color: ${({ active, theme }) => (active ? '#06fc99' : theme.text3)};
  outline: none;

  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

const SORT_FIELD = {
  VALUE: 'amountUSD',
  AMOUNT0: 'token0Amount',
  AMOUNT1: 'token1Amount',
  TIMESTAMP: 'timestamp',
}

const TXN_TYPE = {
  ALL: 'all',
  SWAP: 'swaps',
  ADD: 'adds',
  REMOVE: 'removes',
}

const ITEMS_PER_PAGE = 10

function getTransactionType(event, symbol0, symbol1) {
  const formattedS0 = symbol0?.length > 8 ? symbol0.slice(0, 7) + '...' : symbol0
  const formattedS1 = symbol1?.length > 8 ? symbol1.slice(0, 7) + '...' : symbol1
  switch (event) {
    case TXN_TYPE.ADD:
      return 'add ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.REMOVE:
      return 'remove ' + formattedS0 + ' and ' + formattedS1
    case TXN_TYPE.SWAP:
      return 'swap ' + formattedS0 + ' for ' + formattedS1
    default:
      return ''
  }
}

// @TODO rework into virtualized list
function TxnList({ transactions, symbol0Override, symbol1Override, color }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [filteredItems, setFilteredItems] = useState()
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL)

  const [currency] = useCurrentCurrency()

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [transactions])

  // parse the txns and format for UI
  useEffect(() => {
    if (transactions && transactions.mints && transactions.burns && transactions.swaps) {
      let newTxns = []
      if (transactions.mints.length > 0) {
        transactions.mints.map((mint) => {
          let newTxn = {}
          newTxn.hash = mint.transaction.id
          newTxn.timestamp = mint.timestamp
          newTxn.type = TXN_TYPE.ADD
          newTxn.token0Amount = mint.amount0
          newTxn.token1Amount = mint.amount1
          newTxn.account = mint.to
          newTxn.token0Symbol = updateNameData(mint.pair).token0.symbol
          newTxn.token1Symbol = updateNameData(mint.pair).token1.symbol
          newTxn.amountUSD = mint.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.burns.length > 0) {
        transactions.burns.map((burn) => {
          let newTxn = {}
          newTxn.hash = burn.transaction.id
          newTxn.timestamp = burn.timestamp
          newTxn.type = TXN_TYPE.REMOVE
          newTxn.token0Amount = burn.amount0
          newTxn.token1Amount = burn.amount1
          newTxn.account = burn.sender
          newTxn.token0Symbol = updateNameData(burn.pair).token0.symbol
          newTxn.token1Symbol = updateNameData(burn.pair).token1.symbol
          newTxn.amountUSD = burn.amountUSD
          return newTxns.push(newTxn)
        })
      }
      if (transactions.swaps.length > 0) {
        transactions.swaps.map((swap) => {
          const netToken0 = swap.amount0In - swap.amount0Out
          const netToken1 = swap.amount1In - swap.amount1Out

          let newTxn = {}

          if (netToken0 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair).token0.symbol
            newTxn.token1Symbol = updateNameData(swap.pair).token1.symbol
            newTxn.token0Amount = Math.abs(netToken0)
            newTxn.token1Amount = Math.abs(netToken1)
          } else if (netToken1 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair).token1.symbol
            newTxn.token1Symbol = updateNameData(swap.pair).token0.symbol
            newTxn.token0Amount = Math.abs(netToken1)
            newTxn.token1Amount = Math.abs(netToken0)
          }

          newTxn.hash = swap.transaction.id
          newTxn.timestamp = swap.timestamp
          newTxn.type = TXN_TYPE.SWAP

          newTxn.amountUSD = swap.amountUSD
          newTxn.account = swap.to
          return newTxns.push(newTxn)
        })
      }

      const filtered = newTxns.filter((item) => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter
        }
        return true
      })
      setFilteredItems(filtered)
      let extraPages = 1
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      if (filtered.length === 0) {
        setMaxPage(1)
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages)
      }
    }
  }, [transactions, txFilter])

  useEffect(() => {
    setPage(1)
  }, [txFilter])

  const filteredList =
    filteredItems &&
    filteredItems
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const below1080 = useMedia('(max-width: 1080px)')
  const below780 = useMedia('(max-width: 780px)')

  const ListItem = ({ item }) => {
    return (
      <tr>
        <td area="txn" fontWeight="500">
          <CustomLink color="#027733" external href={urls.showTransaction(item.hash)}>
            {getTransactionType(item.type, item.token1Symbol, item.token0Symbol)}
          </CustomLink>
        </td>
        <td area="value">
          {currency === 'CANTO' ? 'Ⓒ ' + formattedNum(item.valueCANTO) : formattedNum(item.amountUSD, true)}
        </td>
        {!below780 && (
          <>
            <td area="amountOther">
              {formattedNum(item.token1Amount) + ' '} {item.token1Symbol}
            </td>
            <td area="amountToken">
              {formattedNum(item.token0Amount) + ' '}
              {item.token0Symbol}
            </td>
          </>
        )}
        {!below1080 && (
          <td area="account">
            <CustomLink color="#027733" external href={'https://evm.explorer.canto.io/address/' + item.account}>
              {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
            </CustomLink>
          </td>
        )}
        <td area="time">{formatTime(item.timestamp)}</td>
      </tr>
    )
  }

  return (
    <>
      <Table>
        <thead>
          <th>
            {below780 ? (
              <DropdownSelect options={TXN_TYPE} active={txFilter} setActive={setTxFilter} color="#06fc99" />
            ) : (
              <>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.ALL)
                  }}
                  active={txFilter === TXN_TYPE.ALL}
                >
                  All
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.SWAP)
                  }}
                  active={txFilter === TXN_TYPE.SWAP}
                >
                  Swaps
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.ADD)
                  }}
                  active={txFilter === TXN_TYPE.ADD}
                >
                  Adds
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.REMOVE)
                  }}
                  active={txFilter === TXN_TYPE.REMOVE}
                >
                  Removes
                </SortText>
              </>
            )}
          </th>
          <th>
            <ClickableText
              area="value"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.VALUE)
                setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
              }}
            >
              Total Value {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
          <th>
            {!below780 && (
              <ClickableText
                area="amountToken"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT0)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection)
                }}
              >
                {symbol0Override ? symbol0Override + ' Amount' : 'Token Amount'}{' '}
                {sortedColumn === SORT_FIELD.AMOUNT0 ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            )}
          </th>
          <th>
            {!below780 && (
              <ClickableText
                area="amountOther"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT1)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT1 ? true : !sortDirection)
                }}
              >
                {symbol1Override ? symbol1Override + ' Amount' : 'Token Amount'}{' '}
                {sortedColumn === SORT_FIELD.AMOUNT1 ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            )}
          </th>
          {!below1080 && <th>Account</th>}
          <th>
            <ClickableText
              area="time"
              onClick={() => {
                setSortedColumn(SORT_FIELD.TIMESTAMP)
                setSortDirection(sortedColumn !== SORT_FIELD.TIMESTAMP ? true : !sortDirection)
              }}
            >
              Time {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
        </thead>
        <tbody>
          {!filteredList ? (
            <tr>
              <td></td>
              <td>Loading...</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ) : filteredList.length === 0 ? (
            <EmptyCard>No recent transactions found.</EmptyCard>
          ) : (
            filteredList.map((item, index) => {
              return <ListItem key={index} index={index + 1} item={item} />
            })
          )}
        </tbody>
      </Table>
      <PageButtons>
        <div
          onClick={(e) => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div
          onClick={(e) => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </>
  )
}

export default TxnList
