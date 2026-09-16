import { useEffect, useMemo, useState } from 'react'
import {
  fetchWaAndarias,
  subscribeToWaAndariasSse,
  type WaAndariasRow,
} from '../services/waAndarias'

function getMessageTime(row: WaAndariasRow) {
  return typeof row.status_time === 'string' ? row.status_time : ''
}

function sortMessages(rows: WaAndariasRow[]) {
  return [...rows].sort((a, b) => {
    const aTime = Date.parse(getMessageTime(a)) || 0
    const bTime = Date.parse(getMessageTime(b)) || 0
    return bTime - aTime
  })
}

function mergeRow(rows: WaAndariasRow[], row: WaAndariasRow) {
  const next = rows.filter((item) => item.wa_message_id !== row.wa_message_id)
  return sortMessages([row, ...next])
}

function removeRow(rows: WaAndariasRow[], row: WaAndariasRow) {
  return rows.filter((item) => item.wa_message_id !== row.wa_message_id)
}

function getText(row: WaAndariasRow, key: string) {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}

export function ChatView() {
  const [messages, setMessages] = useState<WaAndariasRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING')

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      try {
        const rows = await fetchWaAndarias()
        if (!mounted) return
        setMessages(sortMessages(rows))
        setError(null)
      } catch (reason: unknown) {
        if (!mounted) return
        setError(reason instanceof Error ? reason.message : 'Unable to load messages')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void refresh()

    const unsubscribe = subscribeToWaAndariasSse((event) => {
      if (!mounted) return

      if (event.type === 'ready') {
        setMessages(sortMessages(event.data.data))
        setError(null)
        return
      }

      if (event.type === 'insert' || event.type === 'update') {
        setMessages((current) => mergeRow(current, event.data))
        return
      }

      if (event.type === 'delete') {
        setMessages((current) => removeRow(current, event.data))
        return
      }

      if (event.type === 'error') {
        setError(event.data.error)
      }
    }, (status) => {
      if (mounted) setRealtimeStatus(status)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const statusLabel = useMemo(
    () => (realtimeStatus === 'LIVE' ? 'Live' : realtimeStatus),
    [realtimeStatus],
  )

  if (loading) {
    return (
      <section className="p-4" aria-label="Chat view" aria-busy="true">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-28 rounded bg-slate-200" />
          <div className="h-16 w-full rounded bg-slate-200" />
          <div className="h-16 w-4/5 rounded bg-slate-200" />
          <div className="h-16 w-3/5 rounded bg-slate-200" />
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-full flex-col" aria-label="Chat view">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Chat</h2>
          <p className="text-xs text-slate-500">{statusLabel}</p>
        </div>
        <span className="text-xs text-slate-400">{messages.length}</span>
      </div>

      {error && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!error && messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-slate-500">
          No messages yet.
        </div>
      )}

      <div className="space-y-3 p-4">
        {messages.map((message) => {
          const firstName = getText(message, 'first_name') || 'Unknown'
          const text = getText(message, 'user_message') || 'No message content'
          const time = getMessageTime(message)

          return (
            <article
              key={message.wa_message_id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-semibold text-slate-900">{firstName}</h3>
                {time && (
                  <time className="shrink-0 text-[11px] text-slate-400" dateTime={time}>
                    {new Date(time).toLocaleString()}
                  </time>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
