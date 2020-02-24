import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { render } from 'react-dom'

const whitelist = {
  f: 33,
  s: 31,
  b: 48
}

const App = () => {
  const [screens, addScreen] = useState<string[]>([])

  useEffect(() => {
    const $video = document.querySelector('video') as HTMLVideoElement
    const dpi = window.devicePixelRatio || 1
    const cv = document.createElement('canvas') as HTMLCanvasElement
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D

    const startCapture = async () => {
      try {
        $video.srcObject = await (navigator.mediaDevices as any).getDisplayMedia(
          {
            video: {
              displaySurface: 'application'
            }
          }
        )
      } catch (err) {
        console.error(err)
      }

      return {
        stop: () => {
          ;($video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
          $video.srcObject = null
        }
      }
    }

    const takeScreenshot = async () => {
      cv.width = $video.clientWidth * dpi
      cv.height = $video.clientHeight * dpi

      ctx.drawImage($video, 0, 0, cv.width, cv.height)

      window.requestAnimationFrame(() =>
        addScreen(st => st.concat(cv.toDataURL('image/jpeg', 0.8)))
      )
    }

    const startSocket = async () => {
      const ws = new WebSocket('ws://localhost:8080')

      ws.onmessage = ({ data }) => {
        const { altKey, keycode } = JSON.parse(data)

        if (altKey && Object.values(whitelist).includes(keycode)) {
          takeScreenshot()
        }
      }

      return ws
    }

    window.requestAnimationFrame(async () => {
      try {
        const ws = await startSocket()
        const capture = await startCapture()

        return () => {
          ws.close()
          capture.stop()
        }
      } catch (err) {
        console.error(err)
      }
    })
  }, [addScreen])

  useEffect(() => {
    if (!screens.length) {
      const cache = window.sessionStorage.getItem('screens')

      if (cache) {
        addScreen(JSON.parse(cache))
      }

      return
    }

    window.sessionStorage.setItem('screens', JSON.stringify(screens))
  }, [screens])

  return (
    <main>
      <video autoPlay />

      <figure>
        {screens.map(s => (
          <img key={s} src={s} />
        ))}
      </figure>
    </main>
  )
}

render(<App />, document.getElementById('root'))
