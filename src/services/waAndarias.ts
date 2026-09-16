export const WA_ANDARIAS_ENDPOINT =
  'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/get-wa-andarias'

export const WA_ANDARIAS_STREAM_ENDPOINT = `${WA_ANDARIAS_ENDPOINT}?stream=true`

export type WaAndariasRow = Record<string, unknown> & {
  wa_message_id: string
  status_time?: string | null
}

type WaAndariasResponse = {
  success: boolean
  count: number
  data: WaAndariasRow[]
}

export async function fetchWaAndarias(): Promise<WaAndariasRow[]> {
  const response = await fetch(WA_ANDARIAS_ENDPOINT, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`get-wa-andarias failed with HTTP ${response.status}`)
  }

  const payload = (await response.json()) as WaAndariasResponse

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error('get-wa-andarias returned an invalid response')
  }

  return payload.data
}

export type WaAndariasStreamEvent =
  | { type: 'ready'; data: WaAndariasResponse }
  | { type: 'insert' | 'update' | 'delete'; data: WaAndariasRow }
  | { type: 'heartbeat'; data: { timestamp: string } }
  | { type: 'error'; data: { success: false; error: string } }

export function subscribeToWaAndariasSse(
  onEvent: (event: WaAndariasStreamEvent) => void,
  onStatus?: (status: string) => void,
) {
  let stopped = false
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined
  let reconnectAttempt = 0

  const connect = async () => {
    if (stopped) return
    onStatus?.('CONNECTING')
    controller = new AbortController()

    try {
      const response = await fetch(WA_ANDARIAS_STREAM_ENDPOINT, {
        method: 'GET',
        headers: { Accept: 'text/event-stream' },
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`get-wa-andarias stream failed with HTTP ${response.status}`)
      }

      reconnectAttempt = 0
      onStatus?.('LIVE')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!stopped) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          let eventName = 'message'
          let data = ''
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim()
            if (line.startsWith('data:')) data += line.slice(5).trim()
          }
          if (!data) continue
          try {
            onEvent({ type: eventName as WaAndariasStreamEvent['type'], data: JSON.parse(data) } as WaAndariasStreamEvent)
          } catch {
            onStatus?.('ERROR')
          }
        }
      }

      if (!stopped) throw new Error('SSE connection closed')
    } catch (error) {
      if (stopped || (error instanceof DOMException && error.name === 'AbortError')) return
      onStatus?.('RECONNECTING')
      const delay = Math.min(1000 * 2 ** reconnectAttempt, 10000)
      reconnectAttempt += 1
      reconnectTimer = setTimeout(() => void connect(), delay)
    }
  }

  void connect()

  return () => {
    stopped = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    controller?.abort()
    onStatus?.('DISCONNECTED')
  }
}
