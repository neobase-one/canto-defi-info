import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoRow, RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'
import GlobalStats from '../components/GlobalStats'

import { useGlobalData, useGlobalMarkets, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import { CustomLink } from '../components/Link'

import bgNoise from '../assets/bg-noise.gif'
import { PageWrapper, ContentWrapper } from '../components'
import CheckBox from '../components/Checkbox'
import QuestionHelper from '../components/QuestionHelper'
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { IconButton } from '@material-ui/core'

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

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const transactions = useGlobalTransactions()
  const markets = useGlobalMarkets()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  // scrolling refs
  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  // for tracked data on pairs
  const [useTracked, setUseTracked] = useState(true)

  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <PageWrapper>
      <StaticOverlay />
      <ThemedBackground />
      <ContentWrapper>
        <div>
          {['left'].map((anchor) => (
            <React.Fragment key={anchor}>
              <IconButton onClick={toggleDrawer(anchor, true)}>
                <MenuIcon style={{ color: 'red' }} />
              </IconButton>
              <Drawer
                anchor={anchor}
                open={state[anchor]}
                onClose={toggleDrawer(anchor, false)}
              >
                {list(anchor)}
              </Drawer>
            </React.Fragment>
          ))}
        </div>
        <div>
          <AutoColumn gap="14px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
            <TYPE.largeHeader>{below800 ? 'StableSwap Analytics' : 'Canto StableSwap Analytics'}</TYPE.largeHeader>
            {/* <Search /> */}
            <GlobalStats />
          </AutoColumn>
          {below800 && ( // mobile card
            <Box mb={20}>
              <Panel>
                <Box>
                  <AutoColumn gap="36px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Volume (24hrs)</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Liquidity</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>
                          {liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'}
                        </TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
          )}
          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
              <Panel style={{ height: '100%' }}>
                <GlobalChart display="volume" />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
            </AutoColumn>
          )}
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'} style={{ whiteSpace: 'nowrap' }}>
                Top Tokens
              </TYPE.main>
              <CustomLink to={'/tokens'} color="#06fc99">
                See All
              </CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopTokenList tokens={allTokens} />
          </Panel>
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
                Top Pairs
              </TYPE.main>
              <AutoRow gap="4px" width="100%" justifyContent="flex-end">
                <CheckBox
                  checked={useTracked}
                  setChecked={() => setUseTracked(!useTracked)}
                  text={'Hide untracked pairs'}
                />
                <QuestionHelper text="USD amounts may be inaccurate in low liquiidty pairs or pairs without CANTO or stablecoins." />
                <CustomLink to={'/lendingmarket'} color="#06fc99">
                  See All
                </CustomLink>
              </AutoRow>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PairList pairs={allPairs} useTracked={useTracked} />
          </Panel>
          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>
          <Panel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </Panel>
          <br />
          <AutoColumn gap="24px" style={{ paddingBottom: below800 ? '0' : '24px' }} />
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
