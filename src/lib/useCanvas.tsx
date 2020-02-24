import * as React from 'react'
import { useMemo } from 'react'

export default (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const cv = useMemo(
    () => document.createElement('canvas') as HTMLCanvasElement,
    []
  )

  return [cv, cv.getContext('2d') as CanvasRenderingContext2D]
}
