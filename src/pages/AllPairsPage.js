import React, { useEffect, useState } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween, AutoRow } from '../components/Row'
import Search from '../components/Search'
import MktList from '../components/MarketList'
import { AutoColumn } from '../components/Column'
import { useGlobalMarkets } from '../contexts/GlobalData'

import { useMedia } from 'react-use'
import QuestionHelper from '../components/QuestionHelper'
import CheckBox from '../components/Checkbox'

function AllPairsPage() {
  const allPairs = useAllPairData()
  const markets = useGlobalMarkets()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  const [useTracked, setUseTracked] = useState(true)

  return (
    <PageWrapper>
      <FullWrapper>
        {/* <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <AutoRow gap="4px">
          <CheckBox checked={useTracked} setChecked={() => setUseTracked(!useTracked)} text={'Hide untracked pairs'} />
          <QuestionHelper text="USD amounts may be inaccurate in low liquiidty pairs or pairs without CANTO or stablecoins." />
        </AutoRow>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <PairList pairs={allPairs} disbaleLinks={true} maxItems={50} useTracked={useTracked} />
        </Panel> */}
        <AutoColumn gap="14px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
          <TYPE.largeHeader>
            {below800 ? 'Lending Market Analytics' : 'Canto Lending Market Analytics'}
          </TYPE.largeHeader>
        </AutoColumn>
        <span>
          <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
            Markets
          </TYPE.main>
        </span>
        <Panel style={{ margin: '1rem 0' }}>
          <MktList markets={markets} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
