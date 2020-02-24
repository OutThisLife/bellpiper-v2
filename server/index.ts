import ioHook from 'iohook'
import WebSocket from 'ws'

const server = (() => {
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

  wss.on('connection', ws => {
    const handle = (e: any) => ws.send(JSON.stringify(e))

    ioHook.setDebug(true)
    ioHook.on('keydown', handle)

    ws.on('close', () => {
      ioHook.setDebug(false)
      ioHook.off('keydown', handle)
    })
  })

  wss.on('listening', () => ioHook.start())
  wss.on('close', () => ioHook.stop())

  return () => {
    ioHook.stop()
    wss.close()
  }
})()

const signals = [
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`
]

signals.forEach(e => process.on(e as any, server.bind(server)))
