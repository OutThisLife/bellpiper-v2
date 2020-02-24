import ioHook from 'iohook'
import WebSocket from 'ws'

const main = () => {
  try {
    const wss = new WebSocket.Server({
      port: 8080,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    })

    wss.on('connection', ws =>
      ioHook.on('keydown', e => ws.send(JSON.stringify(e)))
    )

    ioHook.start()

    return () => {
      ioHook.stop()
      wss.close()
    }
  } catch (err) {
    console.error(err)
    process.exit(0)
  } finally {
    return () => null
  }
}

const cleanup = main()

interface IOKBEvent {
  shiftKey: boolean
  altKey: boolean
  rawCode: number
  keycode: number
  type: string
}

;[
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`
].forEach((e: any) => process.on(e, cleanup.bind(null)))
