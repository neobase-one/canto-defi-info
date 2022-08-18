import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatTime, formattedNum, urls } from '../utils'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween, AutoRow, RowFixed } from '../components/Row'
import Search from '../components/Search'
import MktList from '../components/MarketList'
import { AutoColumn } from '../components/Column'
import { useGlobalMarkets } from '../contexts/GlobalData'
import { ThemedBackground } from '../Theme'
import bgNoise from '../assets/bg-noise.gif'

import { useMedia } from 'react-use'
import QuestionHelper from '../components/QuestionHelper'
import CheckBox from '../components/Checkbox'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

const Medium = styled.span`
  font-weight: 500;
`

const StaticOverlay = styled.div`
  -webkit-font-smoothing: antialiased;
  /* text-shadow: 0 0 4px #ce540a,0 0 20px #ad0000; */
  /* color: #f95200; */
  /* font-family: otto,Arial,Helvetica,sans-serif; */
  background-attachment: fixed;
  background-repeat: repeat;
  bottom: 0;
  display: block;
  height: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  background-image: url(${bgNoise});
  background-size: 170px;
  mix-blend-mode: lighten;
  opacity: 70%;
  z-index: 600;
`

function AllPairsPage() {
  const allPairs = useAllPairData()
  const markets = useGlobalMarkets()
  var totalSupply = 0
  var totalBorrow = 0
  if (markets) {
    for (var index = 0; index < markets.length; index++) {
      totalBorrow += markets[index].totalBorrows
      totalSupply += markets[index].totalSupply
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')
  const below1295 = useMedia('(max-width: 1295px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below400 = useMedia('(max-width: 400px)')
  const below816 = useMedia('(max-width: 816px)')

  const [useTracked, setUseTracked] = useState(true)

  return (
    <PageWrapper>
      <StaticOverlay />
      <ThemedBackground />
      <FullWrapper>
        <AutoColumn gap="14px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
          <TYPE.largeHeader>
            {below800 ? 'Lending Market Analytics' : 'Canto Lending Market Analytics'}
          </TYPE.largeHeader>
          <Header>
            <RowBetween style={{ padding: below816 ? '0.5rem' : '.5rem' }}>
              <RowFixed>
                {!below1180 && (
                  <TYPE.main mr={'1rem'}>
                    Total supply: <Medium>{formattedNum(totalSupply, true)}</Medium>
                  </TYPE.main>
                )}
                {!below1024 && (
                  <TYPE.main mr={'1rem'}>
                    Total Borrow: <Medium>{formattedNum(totalBorrow, true)}</Medium>
                  </TYPE.main>
                )}
              </RowFixed>
            </RowBetween>
          </Header>
        </AutoColumn>
        {/* <span>
          <TYPE.main fontSize={'1.125rem'}>
            Total supply : ${parseFloat(totalSupply)?.toFixed(2)} Total Borrow : ${parseFloat(totalBorrow)?.toFixed(2)}
          </TYPE.main>
        </span> */}
        <span>
          <TYPE.main fontSize={'1.125rem'}>Markets</TYPE.main>
        </span>
        <Panel style={{ margin: '1rem 0' }}>
          <MktList markets={markets} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
