import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { Box, Flex, Text } from 'rebass'
import TokenLogo from '../TokenLogo'
import { CustomLink } from '../Link'
import Row from '../Row'
import { Divider } from '..'

import { formattedNum, formattedPercent } from '../../utils'
import { useMedia } from 'react-use'
import { withRouter } from 'react-router-dom'
import { TOKEN_BLACKLIST } from '../../constants'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'

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
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
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
  grid-template-areas: 'name liq vol';
  padding: 0 1.125rem;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: 'name symbol liq vol ';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol liq vol price change';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  color: ${({ theme }) => theme.text1} !important;
  @media screen and (max-width: 640px) {
    font-size: 0.85rem;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 'totalLiquidityUSD',
  VOL: 'oneDayVolumeUSD',
  VOL_UT: 'oneDayVolumeUT',
  SYMBOL: 'symbol',
  NAME: 'name',
  PRICE: 'priceUSD',
  CHANGE: 'priceChangeUSD',
}

// @TODO rework into virtualized list
function TopTokenList({ tokens, itemMax = 10, useTracked = false }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.VOL)

  const below1080 = useMedia('(max-width: 1080px)')
  const below680 = useMedia('(max-width: 680px)')
  const below600 = useMedia('(max-width: 600px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [tokens])

  const formattedTokens = useMemo(() => {
    return (
      tokens &&
      Object.keys(tokens)
        .filter((key) => {
          return !TOKEN_BLACKLIST.includes(key)
        })
        .map((key) => tokens[key])
    )
  }, [tokens])

  useEffect(() => {
    if (tokens && formattedTokens) {
      let extraPages = 1
      if (formattedTokens.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(formattedTokens.length / itemMax) + extraPages)
    }
  }, [tokens, formattedTokens, itemMax])

  const filteredList = useMemo(() => {
    return (
      formattedTokens &&
      formattedTokens
        .sort((a, b) => {
          if (sortedColumn === SORT_FIELD.SYMBOL || sortedColumn === SORT_FIELD.NAME) {
            return a[sortedColumn] > b[sortedColumn] ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
          }
          return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        })
        .slice(itemMax * (page - 1), page * itemMax)
    )
  }, [formattedTokens, itemMax, page, sortDirection, sortedColumn])

  const ListItem = ({ item, index }) => {
    return (
      <tr>
        {!below680 && <td>{index}</td>}
        <td>
          <CustomLink>
            {/* <FormattedName
              text={below680 ? item.symbol : item.name}
              maxCharacters={below600 ? 8 : 16}
              adjustSize={true}
              link={true}
            /> */}
            {below680 ? item.symbol : item.name}
          </CustomLink>
        </td>
        {!below680 && (
          <td>
            {/* <FormattedName text={item.symbol} maxCharacters={5} /> */}
            {item.symbol}
          </td>
        )}
        <td>{formattedNum(item.totalLiquidityUSD, true)}</td>
        <td>{formattedNum(item.oneDayVolumeUSD, true)}</td>
        {!below1080 && <td>{formattedNum(item.priceUSD, true)}</td>}
        {!below1080 && <td>{formattedPercent(item.priceChangeUSD)}</td>}
      </tr>
    )
  }

  return (
    <ListWrapper>
      <Table>
        <thead>
          {!below680 && <th></th>}
          <th>
            <ClickableText
              color="text"
              area="name"
              fontWeight="500"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.NAME)
                setSortDirection(sortedColumn !== SORT_FIELD.NAME ? true : !sortDirection)
              }}
            >
              {below680 ? 'Symbol' : 'Name'} {sortedColumn === SORT_FIELD.NAME ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
          {!below680 && (
            <th>
              <ClickableText
                area="symbol"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.SYMBOL)
                  setSortDirection(sortedColumn !== SORT_FIELD.SYMBOL ? true : !sortDirection)
                }}
              >
                Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </th>
          )}

          <th>
            <ClickableText
              area="liq"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.LIQ)
                setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
              }}
            >
              Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
          <th>
            <ClickableText
              area="vol"
              onClick={() => {
                setSortedColumn(useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.VOL)
                setSortDirection(
                  sortedColumn !== (useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.VOL) ? true : !sortDirection
                )
              }}
            >
              Volume (24hrs)
              {sortedColumn === (useTracked ? SORT_FIELD.VOL_UT : SORT_FIELD.VOL) ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
          {!below1080 && (
            <th>
              <ClickableText
                area="price"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.PRICE)
                  setSortDirection(sortedColumn !== SORT_FIELD.PRICE ? true : !sortDirection)
                }}
              >
                Price {sortedColumn === SORT_FIELD.PRICE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </th>
          )}
          {!below1080 && (
            <th>
              <ClickableText
                area="change"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.CHANGE)
                  setSortDirection(sortedColumn !== SORT_FIELD.CHANGE ? true : !sortDirection)
                }}
              >
                Price Change (24hrs)
                {sortedColumn === SORT_FIELD.CHANGE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </th>
          )}
        </thead>
        <tbody>
          {filteredList &&
            filteredList.map((item, index) => {
              return <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={item} />
            })}
        </tbody>
      </Table>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(TopTokenList)
