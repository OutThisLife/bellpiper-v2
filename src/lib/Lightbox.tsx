import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.aside`
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
`

export default ({ id, src, caption }: ILightbox) => {
  return (
    <Wrapper {...{ id }}>
      <a href="#/" />

      <figure
        onClick={e =>
          (e.currentTarget.parentElement as HTMLElement).classList.toggle(
            'expanded'
          )
        }>
        {caption && <figcaption>{caption}</figcaption>}
        <img {...{ src }} />
      </figure>
    </Wrapper>
  )
}

interface ILightbox {
  id: string
  src: string
  caption?: JSX.Element
}
