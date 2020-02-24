import * as React from 'react'
import { useCallback } from 'react'
import styled from 'styled-components'

import { IScreen, keyValue } from '.'
import Lightbox from './Lightbox'
import useCanvas from './useCanvas'

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
`

export default ({ screens, setScreens }: IJournal) => {
  const [cv, ctx] = useCanvas()

  const deleteScreen = useCallback(
    (timestamp: IScreen['timestamp']) => () =>
      setScreens(st => st.filter(s => s && s.timestamp !== timestamp)),
    [setScreens]
  )

  const resetScreens = useCallback(() => setScreens([]), [setScreens])

  const removeColor = useCallback(
    (color: [number, number, number]) => {
      const im = ctx.getImageData(0, 0, cv.width, cv.height)
      const { data } = im

      const isApprox = (a: number, b: number, range: number) => {
        const d = a - b
        return d < range && d > -range
      }

      for (var i = 0, n = data.length; i < n; i += 4) {
        if (
          isApprox(data[i], color[0], 155) &&
          isApprox(data[i + 1], color[1], 155) &&
          isApprox(data[i + 2], color[2], 155)
        ) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(im, 0, 0)
    },
    [cv, ctx]
  )

  const analyze = useCallback(
    async ({ currentTarget }) => {
      const $img = currentTarget.offsetParent.querySelector(
        'img'
      ) as HTMLImageElement
      const $out = document.querySelector('#analyze img') as HTMLImageElement

      cv.width = $img.naturalWidth
      cv.height = $img.naturalHeight

      const worker = window.Tesseract.createWorker({
        logger: console.log
      })

      const draw = async (
        { top = 0, right = 0, bottom = 0, left = 0 },
        work = false
      ) => {
        ctx.clearRect(0, 0, cv.width, cv.height)

        cv.width = $img.naturalWidth - right - left
        cv.height = $img.naturalHeight - top - bottom

        ctx.drawImage($img, -left, -top)
        removeColor([0, 0, 255])

        $out.src = cv.toDataURL('image/jpeg', 1)
        location.hash = 'analyze'

        if (work) {
          try {
            await worker.load()
            await worker.loadLanguage('eng')
            await worker.initialize('eng')
            await worker.setParameters({
              tessedit_char_whitelist: '0123456789.'
            })

            const res = await worker.recognize($out, {})
            console.log(res)

            await worker.terminate()
          } catch (err) {
            console.error(err)
          }
        }
      }

      draw(
        {
          top: cv.height / 2,
          bottom: cv.height / 2.8,
          left: cv.width * 0.94
        },
        true
      )
    },
    [cv, removeColor]
  )

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
              <button onClick={analyze}>anlyz</button>
            </figcaption>

            <a href={`#${timestamp}`}>
              <img {...{ src }} />
            </a>

            <Lightbox
              id={timestamp.toString()}
              {...{ src }}
              caption={
                <>
                  <strong>{keyValue(keycode)}</strong>,<time>{timestamp}</time>
                </>
              }
            />
          </figure>
        ))}

      <Lightbox id="analyze" src="" />
    </Wrapper>
  )
}

interface IJournal {
  screens: IScreen[]
  setScreens: React.Dispatch<React.SetStateAction<IScreen[]>>
}
