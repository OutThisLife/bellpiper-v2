import * as React from 'react'
import { useCallback, useEffect } from 'react'
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

const OCR = false

export default ({ screens, setScreens }: IJournal) => {
  const [cv, ctx] = useCanvas()

  const deleteScreen = useCallback(
    (timestamp: IScreen['timestamp']) => () =>
      setScreens(st => st.filter(s => s && s.timestamp !== timestamp)),
    [setScreens]
  )

  const resetScreens = useCallback(() => setScreens([]), [setScreens])

  const analyze = useCallback(
    (timestamp: IScreen['timestamp']) => async (e: any) => {
      e.preventDefault()

      const id = `analyze-${timestamp}`
      const el = document.getElementById(id) as HTMLElement
      const $caption = el.querySelector('textarea') as HTMLTextAreaElement

      const $out = el.querySelector('img') as HTMLImageElement
      const $in = e.currentTarget
        .closest('figure')
        .querySelector('img') as HTMLImageElement

      location.hash = id
      cv.width = $in.naturalWidth
      cv.height = $in.naturalHeight

      const crop = async ({ top = 0, right = 0, bottom = 0, left = 0 }) => {
        ctx.clearRect(0, 0, cv.width, cv.height)

        cv.width = $in.naturalWidth - right - left
        cv.height = $in.naturalHeight - top - bottom

        ctx.filter = 'saturate(200%)'
        ctx.drawImage($in, -left, -top)

        const imgData = ctx.getImageData(0, 0, cv.width, cv.height)
        const buf = new ArrayBuffer(imgData.data.length)
        const buf8 = new Uint8ClampedArray(buf)
        const data = new Uint32Array(buf)

        for (let i = 0, j = 0; i < imgData.data.length; i += 4) {
          let r = imgData.data[i]
          let g = imgData.data[i + 1]
          let b = imgData.data[i + 2]

          data[j] =
            (r & 0x0f0 ? 0 : g << 24) | // alpha
            (0 << 16) | // blue
            (255 << 8) | // green
            0 // red

          j++
        }

        imgData.data.set(buf8)
        ctx.putImageData(imgData, 0, 0)

        $out.src = cv.toDataURL()
      }

      const read = async () => {
        const worker = window.Tesseract.createWorker({
          logger: ({ progress }: any) => ($caption.value = progress)
        })

        try {
          await worker.load()
          await worker.loadLanguage('eng')
          await worker.initialize('eng')
          await worker.setParameters({
            tessedit_char_whitelist: '0123456789.'
          })

          const res = await worker.recognize(cv, {})

          console.log(res)
          $caption.value = 'hi'
        } catch (err) {
          console.error(err)
        } finally {
          await worker.terminate()
        }
      }

      crop({
        top: 150,
        bottom: 100,
        left: cv.width - 82,
        right: 30
      })
      ;(window as any).draw = (args: any = {}) =>
        crop({
          top: 150,
          bottom: 100,
          left: cv.width - 82,
          right: 30,
          ...args
        })
    },
    [cv, ctx]
  )

  return (
    <Wrapper>
      <div style={{ gridColumn: '3', textAlign: 'right' }}>
        <button onClick={resetScreens}>clear all</button>
      </div>

      {screens
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(({ src, keycode, timestamp }, i) => (
          <figure key={timestamp} onContextMenu={analyze(timestamp)}>
            <figcaption>
              <strong>{keyValue(keycode)}</strong>
              <time>{timestamp}</time>
              <button onClick={deleteScreen(timestamp)}>rm</button>
              <button onClick={analyze(timestamp)}>anlyz</button>
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

            <Lightbox
              id={`analyze-${timestamp}`}
              src=""
              caption={<textarea />}
            />
          </figure>
        ))}
    </Wrapper>
  )
}

interface IJournal {
  screens: IScreen[]
  setScreens: React.Dispatch<React.SetStateAction<IScreen[]>>
}
