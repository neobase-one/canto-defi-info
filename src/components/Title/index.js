import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/canto_logo.png'
import Wordmark from '../../assets/wordmark_white.svg'

import { BasicLink } from '../Link'
import { useMedia } from 'react-use'

const TitleWrapper = styled.div`
  text-decoration: none;
  z-index: 10;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`

const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const Option = styled.div`
  font-weight: 500;
  font-size: 14px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.6)};
  color: ${({ theme }) => theme.white};
  display: flex;
  margin-left: 12px;
  :hover {
    opacity: 1;
  }
`

export default function Title() {
  const history = useHistory()
  const below1080 = useMedia('(max-width: 1080px)')

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center" style={{ justifyContent: 'space-between' }}>
        <RowFixed>
          <UniIcon id="link" onClick={() => history.push('/')}>
            <img width={'100px'} style={{ marginLeft: '2px', marginTop: '5px' }} src={Logo} alt="logo" />
          </UniIcon>
          {/* {!below1080 && (
            <img width={'84px'} style={{ marginLeft: '8px', marginTop: '0px' }} src={Wordmark} alt="logo" />
          )} */}
        </RowFixed>
        {below1080 && (
          <RowFixed style={{ alignItems: 'flex-end' }}>
            <BasicLink to="/stableswap">
              <Option activeText={history.location.pathname === '/stableswap' ?? undefined}>stable swap</Option>
            </BasicLink>
            <BasicLink to="/lendingmarket">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'pairs' ||
                    history.location.pathname.split('/')[1] === 'pair') ??
                  undefined
                }
              >
                lending market
              </Option>
            </BasicLink>
          </RowFixed>
        )}
      </Flex>
    </TitleWrapper>
  )
}
