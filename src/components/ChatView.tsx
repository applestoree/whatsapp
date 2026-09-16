import { useEffect, useMemo, useState } from 'react'
import {
  fetchWaAndarias,
  sendWaMessage,
  subscribeToWaAndarias,
  type WaAndariasRealtimeStatus,
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

function sortRows(rows: WaAndariasRow[]) {
  return [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

function mergeRows(current: WaAndariasRow[], incoming: WaAndariasRow[]) {
  const byId = new Map(current.map((row) => [row.wa_message_id, row]))
  incoming.forEach((row) => byId.set(row.wa_message_id, row))
  return sortRows([...byId.values()])
}

function realtimeStatusText(status: WaAndariasRealtimeStatus) {
  switch (status) {
    case 'SUBSCRIBED':
      return 'Realtime connected'
    case 'CHANNEL_ERROR':
      return 'Realtime channel error'
    case 'TIMED_OUT':
      return 'Realtime timed out'
    case 'CLOSED':
      return 'Realtime closed'
    default:
      return 'Connecting…'
  }
}

function conversationName(row: WaAndariasRow) {
  return row.first_name || row.chat_id || 'Unknown'
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isOutgoing(row: WaAndariasRow) {
  return Boolean(row.agent_name?.trim())
}

function ConversationList({
  rows,
  onOpen,
}: {
  rows: WaAndariasRow[]
  onOpen: (chatId: string) => void
}) {
  const conversations = useMemo(() => {
    const grouped = new Map<string, WaAndariasRow[]>()
    rows.forEach((row) => {
      if (!row.chat_id) return
      const existing = grouped.get(row.chat_id) ?? []
      existing.push(row)
      grouped.set(row.chat_id, existing)
    })

    return [...grouped.entries()]
      .map(([chatId, messages]) => {
        const sorted = sortRows(messages)
        return { chatId, last: sorted[sorted.length - 1] }
      })
      .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at))
  }, [rows])

  if (conversations.length === 0) {
    return <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-slate-500">No conversations yet.</div>
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map(({ chatId, last }) => (
        <button
          key={chatId}
          type="button"
          onClick={() => onOpen(chatId)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-slate-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            {conversationName(last).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-semibold">{conversationName(last)}</span>
              <time className="shrink-0 text-[11px] text-slate-400">{formatTime(last.created_at)}</time>
            </div>
            <p className="mt-1 truncate text-sm text-slate-500">{messageText(last)}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function MessagePage({
  rows,
  chatId,
  status,
  onBack,
}: {
  rows: WaAndariasRow[]
  chatId: string
  status: string
  onBack: () => void
}) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messages = useMemo(
    () => rows.filter((row) => row.chat_id === chatId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [rows, chatId],
  )

  const contact = messages[0]
  const title = contact ? conversationName(contact) : chatId

  async function handleSend() {
    const message = draft.trim()
    if (!message || sending) return

    setSending(true)
    setSendError(null)
    try {
      await sendWaMessage(message, chatId)
      setDraft('')
    } catch (error: unknown) {
      setSendError(error instanceof Error ? error.message : 'Unable to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-50" aria-label="Message page">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3">
        <button type="button" onClick={onBack} aria-label="Back" className="rounded-full px-2 py-1 text-xl text-slate-700 hover:bg-slate-100">
          ‹
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{title}</div>
          <div className="text-xs text-slate-500">{status}</div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {messages.map((row) => {
            const outgoing = isOutgoing(row)
            return (
              <div key={row.wa_message_id} className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}>
                <article className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${outgoing ? 'rounded-br-md bg-green-100' : 'rounded-bl-md bg-white'}`}>
                  <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{messageText(row)}</p>
                  <time className="mt-1 block text-right text-[10px] text-slate-400">{formatTime(row.created_at)}</time>
                </article>
              </div>
            )
          })}
        </div>
      </div>

      {sendError ? <div className="shrink-0 bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">{sendError}</div> : null}

      <form
        className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white p-2"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSend()
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={sending}
          placeholder="Type a message"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </section>
  )
}

export function ChatView({ onMessageOpen }: { onMessageOpen?: (open: boolean) => void }) {
  const [rows, setRows] = useState<WaAndariasRow[]>([])
  const [status, setStatus] = useState('Connecting…')
  const [error, setError] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const unsubscribe = subscribeToWaAndarias(
      (row) => {
        if (!mounted) return
        setRows((current) => mergeRows(current, [row]))
        setError(null)
      },
      (row) => {
        if (!mounted) return
        setRows((current) => current.map((item) => (item.wa_message_id === row.wa_message_id ? row : item)))
      },
      (row) => {
        if (!mounted) return
        setRows((current) => current.filter((item) => item.wa_message_id !== row.wa_message_id))
      },
      (realtimeStatus, realtimeError) => {
        if (!mounted) return
        setStatus(realtimeStatusText(realtimeStatus))
        if (realtimeStatus === 'SUBSCRIBED') {
          setError(null)
          return
        }
        if (realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT') {
          setError(realtimeError instanceof Error ? realtimeError.message : 'Realtime connection failed')
        }
      },
    )

    void fetchWaAndarias()
      .then((data) => {
        if (!mounted) return
        setRows((current) => mergeRows(current, data))
      })
      .catch((fetchError: unknown) => {
        if (!mounted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load messages')
      })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    onMessageOpen?.(selectedChatId !== null)
    return () => onMessageOpen?.(false)
  }, [selectedChatId, onMessageOpen])

  if (selectedChatId) {
    return <MessagePage rows={rows} chatId={selectedChatId} status={status} onBack={() => setSelectedChatId(null)} />
  }

  return (
    <section className="flex min-h-full flex-col" aria-label="Chat view">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Chat</h2>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
        <span className="text-xs text-slate-400">{rows.length}</span>
      </div>
      {error ? <div className="px-4 py-3 text-sm text-red-600" role="alert">{error}</div> : null}
      <ConversationList rows={rows} onOpen={setSelectedChatId} />
    </section>
  )
}
