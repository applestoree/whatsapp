import { useEffect, useState } from 'react'
import {
  fetchWaAndarias,
  subscribeToWaAndarias,
  type WaAndariasRow,
} from '../services/waAndarias'

function messageText(row: WaAndariasRow) {
  if (typeof row.user_message === 'string') return row.user_message
  if (row.user_message && typeof row.user_message === 'object') {
    const value = row.user_message as Record<string, unknown>
    const text = value.text ?? value.message ?? value.body
    if (typeof text === 'string') return text
    return JSON.stringify(row.user_message)
  }
  return 'Message'
}

export function ChatView() {
  const [rows, setRows] = useState<WaAndariasRow[]>([])
  const [status, setStatus] = useState('Connecting…')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    void fetchWaAndarias()
      .then((data) => {
        if (!mounted) return
        setRows(data)
        setStatus('Realtime connected')
      })
      .catch((fetchError: unknown) => {
        if (!mounted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load messages')
        setStatus('Connection error')
      })

    const unsubscribe = subscribeToWaAndarias(
      (row) => {
        if (!mounted) return
        setRows((current) => {
          const withoutDuplicate = current.filter((item) => item.wa_message_id !== row.wa_message_id)
          return [...withoutDuplicate, row].sort((a, b) => a.created_at.localeCompare(b.created_at))
        })
        setStatus('Realtime connected')
      },
      (row) => {
        if (!mounted) return
        setRows((current) => current.map((item) => (item.wa_message_id === row.wa_message_id ? row : item)))
      },
      (row) => {
        if (!mounted) return
        setRows((current) => current.filter((item) => item.wa_message_id !== row.wa_message_id))
      },
    )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return (
    <section className="flex min-h-full flex-col" aria-label="Chat view">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Chat</h2>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
        <span className="text-xs text-slate-400">{rows.length}</span>
      </div>

      {error ? (
        <div className="px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-slate-500">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {rows.map((row) => (
            <article key={row.wa_message_id} className="rounded-2xl bg-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold">
                  {row.first_name || row.agent_name || row.chat_id || 'Unknown'}
                </span>
                <time className="shrink-0 text-[11px] text-slate-400">
                  {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <p className="mt-1 break-words text-sm text-slate-700">{messageText(row)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
