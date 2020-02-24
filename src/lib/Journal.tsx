import * as React from 'react'
import { useCallback } from 'react'
import styled from 'styled-components'

import { IScreen, keyValue } from '.'

const Wrapper = styled.section`
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: calc(var(--pad) / 2);
  align-items: flex-start;
  justify-content: center;
  position: relative;
  min-height: 40vh;
  padding: var(--pad);
  box-shadow: 0 -20px 50px #000;
  background: var(--bg);

  figure {
    position: relative;
    margin: 0;

    > a {
      cursor: zoom-in;
      display: block;
    }

    img {
      box-shadow: 0 6px 12px #00000033;
    }

    figcaption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: calc(var(--pad) / 6);

      time {
        opacity: 0.2;
        display: block;
      }

      strong {
        font-weight: 700;
        letter-spacing: 0.02em;
      }
    }

    &:not(:hover) figcaption button {
      visibility: hidden;
    }
  }

  aside[id] {
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    overscroll-behavior: contain;
    background: #000000d1;

    &.expanded {
      justify-content: normal;

      img {
        max-width: none;
        max-height: none;
      }
    }

    &:not(:target) {
      display: none;
    }

    > a {
      cursor: zoom-out;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
    }

    figure {
      padding: var(--pad);
      margin: auto;

      figcaption {
        color: #fff;

        strong {
          position: sticky;
          left: var(--pad);
        }

        time {
          margin-right: auto;
          margin-left: 1em;
        }
      }

      img {
        max-height: calc(100vh - var(--pad) * 2);
        margin: auto;
      }
    }
  }
`

export default ({ screens, setScreens }: IJournal) => {
  const deleteScreen = useCallback(
    (timestamp: IScreen['timestamp']) => () =>
      setScreens(st => st.filter(s => s && s.timestamp !== timestamp)),
    [setScreens]
  )

  const resetScreens = useCallback(() => setScreens([]), [setScreens])

  return (
    <Wrapper>
      <div style={{ gridColumn: '3', textAlign: 'right' }}>
        <button onClick={resetScreens}>clear all</button>
      </div>

      {screens
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(({ src, keycode, timestamp }, i) => (
          <figure key={timestamp}>
            <figcaption>
              <strong>{keyValue(keycode)}</strong>
              <time>{timestamp}</time>
              <button onClick={deleteScreen(timestamp)}>rm</button>
            </figcaption>

            <a href={`#${timestamp}`}>
              <img {...{ src }} />
            </a>

            <aside id={timestamp.toString()}>
              <a href="#/" />

              <figure
                onClick={e =>
                  (e.currentTarget
                    .parentElement as HTMLElement).classList.toggle('expanded')
                }>
                <figcaption>
                  <strong>{keyValue(keycode)}</strong>
                  <time>{timestamp}</time>
                </figcaption>

                <img {...{ src }} />
              </figure>
            </aside>
          </figure>
        ))}
    </Wrapper>
  )
}

interface IJournal {
  screens: IScreen[]
  setScreens: React.Dispatch<React.SetStateAction<IScreen[]>>
}
