import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Journal from './Journal'
import Video from './Video'

export const VALID_KEYS = {
  FLATN: 33,
  SHORT: 31,
  LONG: 48
} as const

export const keyValue = (v: IScreen['keycode']) =>
  (Object.keys(VALID_KEYS) as KeysOf<typeof VALID_KEYS>).find(
    k => VALID_KEYS[k] === v
  ) as keyof typeof VALID_KEYS

export default () => {
  const $video = useRef<HTMLVideoElement>(document.createElement('video'))
  const [screens, setScreens] = useState<IScreen[]>(
    JSON.parse(window.sessionStorage.getItem('screens') || '[]')
  )

  const { cv, ctx } = useMemo(() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement

    return {
      cv,
      ctx: cv.getContext('2d') as CanvasRenderingContext2D
    }
  }, [])

  const takeScreenshot = useCallback(
    (keycode: IScreen['keycode']) => {
      cv.width = $video.current.videoWidth
      cv.height = $video.current.videoHeight
      ctx.drawImage($video.current, 0, 0, cv.width, cv.height)

      const screen: IScreen = {
        timestamp: +new Date(),
        keycode,
        src: cv.toDataURL('image/jpeg', 0.8)
      }

      setScreens(st => [...st.filter(s => s), screen])
      return screen
    },
    [$video, setScreens]
  )

  const notify = useCallback(async ({ timestamp, keycode, src }: IScreen) => {
    try {
      if ((await window.Notification.requestPermission()) == 'granted') {
        const n = new window.Notification(keyValue(keycode), {
          silent: true,
          timestamp,
          image: src,
          tag: 'bellpiper'
        })

        setTimeout(n.close.bind(n), 3e3)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const stream = useCallback(
    async () =>
      ($video.current.srcObject = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: { cursor: 'always' }
      })),
    [$video]
  )

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')

    ws.onopen = async () => {
      if (!$video.current.srcObject) {
        try {
          await stream()
        } catch (err) {
          console.error(err)
        }
      }

      window.onbeforeunload = () => ws.close()
    }

    ws.onmessage = ({ data }) => {
      const { altKey, keycode } = JSON.parse(data)

      if (altKey && Object.values(VALID_KEYS).includes(keycode)) {
        notify(takeScreenshot(keycode))
      }
    }
  }, [stream, takeScreenshot, notify])

  useEffect(() => {
    window.sessionStorage.setItem('screens', JSON.stringify(screens))
  }, [screens])

  return (
    <>
      <Video {...{ $video, stream }} />
      <Journal {...{ screens, setScreens }} />
    </>
  )
}

export interface IScreen {
  note?: string
  timestamp: number
  keycode: ValueOf<typeof VALID_KEYS>
  src: string
}
