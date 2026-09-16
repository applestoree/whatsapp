import { useState } from 'react'

type View = 'chat' | 'orders' | 'settings'
type Overlay = 'toast' | 'bottom-sheet' | 'modal' | 'dialog' | null

function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4">
      <div className="text-xl font-semibold">AppleStoree</div>
      <button
        type="button"
        aria-label="Settings"
        className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
      >
        ⚙
      </button>
    </header>
  )
}

function ChatView() {
  return (
    <section className="p-4" aria-label="Chat view">
      <h2 className="text-lg font-semibold">Chat</h2>
      <p className="mt-1 text-sm text-slate-500">Chat view ready.</p>
    </section>
  )
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />
}

function OrdersView() {
  return (
    <section className="space-y-4 p-4" aria-label="Orders view">
      <SkeletonBlock className="h-7 w-32" />
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-20 w-full" />
    </section>
  )
}

function SettingsView() {
  return (
    <section className="space-y-4 p-4" aria-label="Settings view">
      <SkeletonBlock className="h-7 w-32" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
    </section>
  )
}

function Content({ view }: { view: View }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {view === 'chat' && <ChatView />}
      {view === 'orders' && <OrdersView />}
      {view === 'settings' && <SettingsView />}
    </main>
  )
}

function BottomNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const items: { view: View; label: string; icon: string }[] = [
    { view: 'chat', label: 'Chat', icon: '💬' },
    { view: 'orders', label: 'Orders', icon: '📦' },
    { view: 'settings', label: 'Settings', icon: '⚙' },
  ]

  return (
    <nav className="grid shrink-0 grid-cols-3 border-t border-slate-200 bg-white" aria-label="Bottom navigation">
      {items.map((item) => (
        <button
          key={item.view}
          type="button"
          aria-current={view === item.view ? 'page' : undefined}
          onClick={() => onChange(item.view)}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
            view === item.view ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function MobileOverlay({ type }: { type: Overlay }) {
  if (!type) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50" aria-live="polite">
      <div className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
        {type === 'toast' && 'Toast'}
        {type === 'bottom-sheet' && 'BottomSheet'}
        {type === 'modal' && 'Modal'}
        {type === 'dialog' && 'Dialog'}
      </div>
    </div>
  )
}

function App() {
  const [view, setView] = useState<View>('chat')
  const [overlay] = useState<Overlay>(null)

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[500px] flex-col overflow-hidden bg-white text-slate-900">
      <Header />
      <Content view={view} />
      <BottomNav view={view} onChange={setView} />
      <MobileOverlay type={overlay} />
    </div>
  )
}

export default App
