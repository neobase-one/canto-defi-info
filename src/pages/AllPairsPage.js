import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatTime, formattedNum, urls } from '../utils'
import 'feather-icons'
import { useHistory } from 'react-router-dom'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData } from '../contexts/PairData'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween, AutoRow, RowFixed } from '../components/Row'
import Search from '../components/Search'
import MktList from '../components/MarketList'
import { AutoColumn } from '../components/Column'
import { useGlobalMarkets } from '../contexts/GlobalData'
import { ThemedBackground } from '../Theme'
import bgNoise from '../assets/bg-noise.gif'

import { useMedia } from 'react-use'
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Icon, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useSessionStart } from '../contexts/Application'
import { Box } from 'rebass'
import Logo from "../assets/logo.svg"

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

const Medium = styled.span`
  font-weight: 500;
`

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  },
  paper: {
    background: "black",
  }
});

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

const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
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

  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const seconds = useSessionStart()
  const history = useHistory()

  const sideBarText = {
    color: "#06fc99",
    fontFamily: "IBM Plex Mono, monospace",
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem key={"stableswap"} disablePadding>
          <ListItem button key={"stableswap"} onClick={() => history.push('/stableswap')}>
            <ListItemText primaryTypographyProps={{ style: sideBarText }} primary={"> Stable Swap"} />
          </ListItem>
        </ListItem>
        <ListItem key={"lendingmarket"} disablePadding>
          <ListItem button key={"lendingmarket"} onClick={() => history.push('/lendingmarket')}>
            <ListItemText primaryTypographyProps={{ style: sideBarText }} primary={"> Lending Market"} color="green" />
          </ListItem>
        </ListItem>
      </List>
      <Divider />
      <Polling style={{ marginLeft: '.5rem' }}>
        <PollingDot />
        <a href="/" style={{ color: 'white' }}>
          <TYPE.small color={'white'}>
            Updated {!!seconds ? seconds + 's' : '-'} ago <br />
          </TYPE.small>
        </a>
      </Polling>
    </Box>
  );

  const classes = useStyles();

  return (
    <PageWrapper>
      <StaticOverlay />
      <ThemedBackground />
      <FullWrapper>
        <div>
          {['left'].map((anchor) => (
            <React.Fragment key={anchor}>
              <div style={{ display: "flex" }}>
                <IconButton onClick={toggleDrawer(anchor, true)}>
                  <MenuIcon style={{ color: '#06fc99' }} />
                </IconButton>
                <img src={Logo} />
                {/* <div style={{ color: "#06fc99" }}>Canto</div> */}
              </div>
              <Drawer
                classes={{ paper: classes.paper }}
                anchor={anchor}
                open={state[anchor]}
                onClose={toggleDrawer(anchor, false)}
              >
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "10%" }}>
                  <img src={Logo} width="15%" />
                  {/* <div style={{ color: "#06fc99" }}>Canto</div> */}
                </div>
                {list(anchor)}
              </Drawer>
            </React.Fragment>
          ))}
        </div>
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
