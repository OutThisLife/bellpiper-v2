import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.section`
  z-index: 1;
  position: sticky;
  top: 0;
  padding: 0 var(--pad);
  background: #000;

  figure {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 80vw;
    height: 60vh;
    margin: auto;
    background: #ffffff11;
  }
`

export default ({ $video, stream: onClick }: IVideo) => (
  <Wrapper>
    <figure {...{ onClick }}>
      <video ref={$video} autoPlay muted />
    </figure>
  </Wrapper>
)

interface IVideo {
  $video: React.MutableRefObject<HTMLVideoElement>
  stream: () => Promise<MediaStream | MediaSource | Blob | null>
}
