export function ChatView() {
  return (
    <section className="flex min-h-full flex-col" aria-label="Chat view">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Chat</h2>
          <p className="text-xs text-slate-500">No realtime connection</p>
        </div>
        <span className="text-xs text-slate-400">0</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-slate-500">
        No messages yet.
      </div>
    </section>
  )
}
