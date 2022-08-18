import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '../../components'
import { withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import FormattedName from '../FormattedName'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../Theme'
import { PAIR_BLACKLIST } from '../../constants'
import { AutoColumn } from '../Column'

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

  opacity: ${({ fade }) => (fade ? '0.6' : '1')};

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.5fr 1fr 1fr};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: center;
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = (field, useTracked) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return useTracked ? 'trackedReserveUSD' : 'reserveUSD'
    case SORT_FIELD.VOL:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    case SORT_FIELD.VOL_7DAYS:
      return useTracked ? 'oneWeekVolumeUSD' : 'oneWeekVolumeUntracked'
    case SORT_FIELD.FEES:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    default:
      return 'trackedReserveUSD'
  }
}

const formatDataText = (value, trackedValue, supressWarning = false) => {
  const showUntracked = value !== '$0' && !trackedValue & !supressWarning
  return (
    <>
      <div style={{ textAlign: 'center' }}>{value}</div>
    </>
  )
}

function PairList({ pairs, color, disbaleLinks, maxItems = 10, useTracked = false }) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      let extraPages = 1
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pairs])

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress]

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(
        !!pairData.trackedReserveUSD ? pairData.trackedReserveUSD : pairData.reserveUSD,
        true
      )

      const volume = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked,
        true
      )

      const apy = formattedPercent(
        ((pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked) * 0.003 * 365 * 100) /
          (pairData.oneDayVolumeUSD ? pairData.trackedReserveUSD : pairData.reserveUSD)
      )

      const weekVolume = formattedNum(
        pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked,
        true
      )

      const fees = formattedNum(
        pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD * 0.003 : pairData.oneDayVolumeUntracked * 0.003,
        true
      )

      return (
        <tr>
          {!below600 && <td>{index}</td>}
          {/* <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              margin={!below740}
            /> */}
          {/* <CustomLink style={{ marginLeft: '20px', whiteSpace: 'nowrap' }} to={'/pair/' + pairAddress} color={color}> */}
          <td>
            <CustomLink color="#027733">
              <FormattedName
                text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                color="#06fc99"
              />
            </CustomLink>
          </td>
          <td area="liq">{formatDataText(liquidity, pairData.trackedReserveUSD)}</td>
          <td area="vol">{formatDataText(volume, pairData.oneDayVolumeUSD)}</td>
          {!below1080 && <td area="volWeek">{formatDataText(weekVolume, pairData.oneWeekVolumeUSD)}</td>}
          {!below1080 && <td area="fees">{formatDataText(fees, pairData.oneDayVolumeUSD)}</td>}
          {!below1080 && (
            <td area="apy">{formatDataText(apy, pairData.oneDayVolumeUSD, pairData.oneDayVolumeUSD === 0)}</td>
          )}
        </tr>
      )
    } else {
      return ''
    }
  }

  const pairList =
    pairs &&
    Object.keys(pairs)
      .filter(
        (address) => !PAIR_BLACKLIST.includes(address) && (useTracked ? !!pairs[address].trackedReserveUSD : true)
      )
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        if (sortedColumn === SORT_FIELD.APY) {
          const apy0 = parseFloat(pairA.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairA.reserveUSD)
          const apy1 = parseFloat(pairB.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairB.reserveUSD)
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn, useTracked)]) >
          parseFloat(pairB[FIELD_TO_VALUE(sortedColumn, useTracked)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
          )
        )
      })

  return (
    <ListWrapper>
      <Table>
        <thead>
          {!below600 && <th></th>}
          <th>Name</th>
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
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.VOL)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
              }}
            >
              Volume (24hrs)
              {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </th>
          {!below1080 && (
            <th>
              <ClickableText
                area="volWeek"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.VOL_7DAYS)
                  setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
                }}
              >
                Volume (7d) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </th>
          )}
          {!below1080 && (
            <th>
              <ClickableText
                area="fees"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.FEES)
                  setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
                }}
              >
                Fees (24hr) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </th>
          )}
          {!below1080 && (
            <th>
              <ClickableText
                area="apy"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.APY)
                  setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection)
                }}
              >
                1y Fees / Liquidity {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
              <QuestionHelper text={'Based on 24hr volume annualized'} />
            </th>
          )}
        </thead>
        <tbody>{!pairList ? <LocalLoader /> : pairList}</tbody>
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
    </ListWrapper>
  )
}

export default withRouter(PairList)
