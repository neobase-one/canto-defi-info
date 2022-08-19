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
import Link from '../Link'
import { Divider, EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { updateNameData } from '../../utils/data'

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
    text-transform : uppercase;
  }
  th:first-child {
    text-transform : lowercase;

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
`;

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: #06fc99;
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
  font-weight: ${({ active, theme }) => (active ? 500 : 400)};
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  outline: none;

  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

const SORT_FIELD = {
  TOTALSUPPLY: 'totalSupply',
  SUPPLYAPY: 'supplyAPY',
  TOTALBORROW: 'totalBorrow',
  BORROWAPY: 'borrowAPY',
}

const TXN_TYPE = {
  MARKETS: 'Markets',
}

const ITEMS_PER_PAGE = 10

// @TODO rework into virtualized list
function MktList({ markets, symbol0Override, symbol1Override, color }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [filteredItems, setFilteredItems] = useState()
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL)

  const [currency] = useCurrentCurrency()


  // parse the mkts and format for UI
  useEffect(() => {
    if (markets) {
      let newMkts = []
      if (markets.length > 0) {
        markets.map((mkt) => {
          let newMkt = {}
          newMkt.market = mkt.symbol;
          newMkt.totalSupply = mkt.totalSupply;
          newMkt.totalBorrows = mkt.totalBorrows;
          newMkt.supplyAPY = mkt?.supplyAPY;
          newMkt.borrowAPY = mkt?.borrowAPY;
          return newMkts.push(newMkt)
        })
      }

      const filtered = newMkts.filter((item) => {
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
  }, [markets, txFilter])
  useEffect(() => {
    console.log(markets)
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [markets])

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

  // const ListItem = ({ item }) => {
  //     return (
  //         <DashGrid style={{ height: '48px' }}>
  //             <DataText area="value">
  //                 {item?.market}
  //             </DataText>
  //             <DataText area="totalSupply">
  //                 {formattedNum(item?.totalSupply, true)}
  //             </DataText>
  //             <DataText area="supplyAPY">
  //                 {(parseFloat(item?.supplyAPY)?.toFixed(3) || 0) + "%"}
  //             </DataText>
  //             <DataText area="totalBorrows">
  //                 {formattedNum(item?.totalBorrows, true)}
  //             </DataText>
  //             <DataText area="borrowAPY">
  //                 {(parseFloat(item?.borrowAPY)?.toFixed(3) || 0) + "%"}
  //             </DataText>
  //         </DashGrid>
  //     )
  // }
  const ListItem = ({ item }) => {
    return (
      <tr>
        <td area="value">
          {item?.market}
        </td>
        <td area="totalSupply">
          {formattedNum(item?.totalSupply, true)}
        </td>
        <td area="supplyAPY">
          {(parseFloat(item?.supplyAPY)?.toFixed(3) || 0) + "%"}
        </td>
        <td area="totalBorrows">
          {formattedNum(item?.totalBorrows, true)}
        </td>
        <td area="borrowAPY">
          {(parseFloat(item?.borrowAPY)?.toFixed(3) || 0) + "%"}
        </td>
      </tr>
    )
  }

  const headings = ["Markets", "Total Supply", "Supply APY", "Total Borrow", "Borrow APY"]
  return (
    <>
      <div
        style={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        <Table>
          <thead>
            <tr>
              <th>
                <ClickableText
                  area="value"
                >
                  Markets
                </ClickableText>
              </th>
              <th>
                <ClickableText
                  area="value"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.TOTALSUPPLY)
                    setSortDirection(sortedColumn !== SORT_FIELD.TOTALSUPPLY ? true : !sortDirection)
                  }}
                >
                  Total Supply {sortedColumn === SORT_FIELD.TOTALSUPPLY ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </th>
              <th>
                <ClickableText
                  area="value"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.SUPPLYAPY)
                    setSortDirection(sortedColumn !== SORT_FIELD.SUPPLYAPY ? true : !sortDirection)
                  }}
                >
                  Supply APY {sortedColumn === SORT_FIELD.SUPPLYAPY ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </th>
              <th>
                <ClickableText
                  area="value"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.TOTALBORROW)
                    setSortDirection(sortedColumn !== SORT_FIELD.TOTALBORROW ? true : !sortDirection)
                  }}
                >
                  Total Borrow {sortedColumn === SORT_FIELD.TOTALBORROW ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </th>
              <th>
                <ClickableText
                  area="value"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.BORROWAPY)
                    setSortDirection(sortedColumn !== SORT_FIELD.BORROWAPY ? true : !sortDirection)
                  }}
                >
                  Borrow APY {sortedColumn === SORT_FIELD.BORROWAPY ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </th>

            </tr>
          </thead>
          <tbody>
            {!filteredList ? (
              <tr>
                <td></td>
                <td></td>
                <td>Loading...</td>
                <td></td>
                <td></td>
              </tr>
            ) : filteredList.length === 0 ? (
              <EmptyCard>No recent transactions found.</EmptyCard>
            ) : (
              filteredList.map((item, index) => {
                return (
                  <ListItem key={index} index={index + 1} item={item} />
                )
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
      </div>
    </>
  )

  // return (
  //     <>
  //         <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
  //             <Flex alignItems="center" justifyContent="flexStart">
  //                 <ClickableText
  //                     color="textDim"
  //                     area="value"
  //                 >
  //                     Markets
  //                 </ClickableText>
  //             </Flex>
  //             <Flex alignIt ems="center">
  //                 <ClickableText
  //                     color="textDim"
  //                     area="value"
  //                     onClick={(e) => {
  //                         setSortedColumn(SORT_FIELD.TOTALSUPPLY)
  //                         setSortDirection(sortedColumn !== SORT_FIELD.TOTALSUPPLY ? true : !sortDirection)
  //                     }}
  //                 >
  //                     Total Supply {sortedColumn === SORT_FIELD.TOTALSUPPLY ? (!sortDirection ? '↑' : '↓') : ''}
  //                 </ClickableText>
  //             </Flex>
  //             <Flex alignItems="center" justifyContent="flexStart">
  //                 <ClickableText
  //                     color="textDim"
  //                     area="value"
  //                     onClick={(e) => {
  //                         setSortedColumn(SORT_FIELD.SUPPLYAPY)
  //                         setSortDirection(sortedColumn !== SORT_FIELD.SUPPLYAPY ? true : !sortDirection)
  //                     }}
  //                 >
  //                     Supply APY {sortedColumn === SORT_FIELD.SUPPLYAPY ? (!sortDirection ? '↑' : '↓') : ''}
  //                 </ClickableText>
  //             </Flex>
  //             <Flex alignItems="center" justifyContent="flexStart">
  //                 <ClickableText
  //                     color="textDim"
  //                     area="value"
  //                     onClick={(e) => {
  //                         setSortedColumn(SORT_FIELD.TOTALBORROW)
  //                         setSortDirection(sortedColumn !== SORT_FIELD.TOTALBORROW ? true : !sortDirection)
  //                     }}
  //                 >
  //                     Total Borrow {sortedColumn === SORT_FIELD.TOTALBORROW ? (!sortDirection ? '↑' : '↓') : ''}
  //                 </ClickableText>
  //             </Flex>
  //             <Flex alignItems="center" justifyContent="flexStart">
  //                 <ClickableText
  //                     color="textDim"
  //                     area="value"
  //                     onClick={(e) => {
  //                         setSortedColumn(SORT_FIELD.BORROWAPY)
  //                         setSortDirection(sortedColumn !== SORT_FIELD.BORROWAPY ? true : !sortDirection)
  //                     }}
  //                 >
  //                     Borrow APY {sortedColumn === SORT_FIELD.BORROWAPY ? (!sortDirection ? '↑' : '↓') : ''}
  //                 </ClickableText>
  //             </Flex>
  //         </DashGrid>
  //         <Divider />
  //         <List p={0}>
  //             {!filteredList ? (
  //                 <LocalLoader />
  //             ) : filteredList.length === 0 ? (
  //                 <EmptyCard>No recent transactions found.</EmptyCard>
  //             ) : (
  //                 filteredList.map((item, index) => {
  //                     return (
  //                         <div key={index}>
  //                             <ListItem key={index} index={index + 1} item={item} />
  //                             <Divider />
  //                         </div>
  //                     )
  //                 })
  //             )}
  //         </List>
  //         <PageButtons>
  //             <div
  //                 onClick={(e) => {
  //                     setPage(page === 1 ? page : page - 1)
  //                 }}
  //             >
  //                 <Arrow faded={page === 1 ? true : false}>←</Arrow>
  //             </div>
  //             <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
  //             <div
  //                 onClick={(e) => {
  //                     setPage(page === maxPage ? page : page + 1)
  //                 }}
  //             >
  //                 <Arrow faded={page === maxPage ? true : false}>→</Arrow>
  //             </div>
  //         </PageButtons>
  //     </>
  // )
}

export default MktList

