import { useState, type ReactNode } from 'react'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Bell, CheckCheck, ChevronRight, CircleHelp, FileText,
  MessageCircle, MoreHorizontal, Plus, Search, Settings, Users, Wifi, X
} from 'lucide-react'

type Tab = 'all' | 'unread'

export default function App() {
  return <div className="app-frame">
    <Routes>
      <Route path="/chat/:chatId" element={<ChatDetailPage />} />
      <Route path="*" element={<AppShell />} />
    </Routes>
    <Overlay />
  </div>
}

function Overlay() { return null }

function AppShell() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  return <>
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark"><MessageCircle size={21} strokeWidth={2.5} /></div>
        <div><div className="brand-title">WhatsApp</div><div className="brand-subtitle">Business workspace</div></div>
      </div>
      <button className="icon-button" aria-label="Notifications" type="button"><Bell size={20} /><span className="notification-dot" /></button>
    </header>
    <main className="page-content">
      <Routes>
        <Route path="/" element={<ChatsPage query={query} setQuery={setQuery} tab={tab} setTab={setTab} />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavItem to="/" label="Chats" icon={<MessageCircle size={21} />} />
      <NavItem to="/contacts" label="Contacts" icon={<Users size={21} />} />
      <NavItem to="/templates" label="Templates" icon={<FileText size={21} />} />
      <NavItem to="/settings" label="Settings" icon={<Settings size={21} />} />
    </nav>
  </>
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{icon}<span>{label}</span></NavLink>
}

function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function ChatsPage({ query, setQuery, tab, setTab }: { query: string; setQuery: (value: string) => void; tab: Tab; setTab: (value: Tab) => void }) {
  return <section>
    <PageHeading title="Chats" description="Your customer conversations" />
    <label className="search-field"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search conversations" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label>
    <div className="filter-row" role="tablist" aria-label="Conversation filter">
      <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'filter-chip selected' : 'filter-chip'} onClick={() => setTab('all')}>All</button>
      <button type="button" role="tab" aria-selected={tab === 'unread'} className={tab === 'unread' ? 'filter-chip selected' : 'filter-chip'} onClick={() => setTab('unread')}>Unread</button>
    </div>
    <EmptyState icon={<MessageCircle size={27} />} title="No conversations yet" description="When your WhatsApp Business messages arrive, your conversations will appear here." />
  </section>
}

function ContactsPage() {
  const [query, setQuery] = useState('')
  return <section>
    <PageHeading title="Contacts" description="Manage your customer contacts" action={<button className="small-action" type="button" disabled title="Available after the contact data source is configured"><Plus size={17} /> Add</button>} />
    <label className="search-field"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search contacts" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label>
    <EmptyState icon={<Users size={27} />} title="No contacts found" description="Contacts connected to your workspace will appear here." />
  </section>
}

function TemplatesPage() {
  return <section>
    <PageHeading title="Templates" description="Manage approved message templates" action={<button className="small-action" type="button" disabled title="Available after the template data source is configured"><Plus size={17} /> Create</button>} />
    <EmptyState icon={<FileText size={27} />} title="No templates available" description="Your WhatsApp message templates will appear here when the data source is connected." />
  </section>
}

function SettingsPage() {
  const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  return <section>
    <PageHeading title="Settings" description="Workspace and integrations" />
    <div className="settings-card"><div className="settings-icon"><MessageCircle size={21} /></div><div className="settings-copy"><strong>WhatsApp Business</strong><span>Account connection</span></div><span className="status-pill pending">Not connected</span></div>
    <div className="settings-card"><div className="settings-icon"><Wifi size={21} /></div><div className="settings-copy"><strong>Supabase</strong><span>{configured ? 'Environment configured' : 'Environment not configured'}</span></div><span className={configured ? 'status-pill ready' : 'status-pill pending'}>{configured ? 'Configured' : 'Pending'}</span></div>
    <div className="settings-card"><div className="settings-icon"><Bell size={21} /></div><div className="settings-copy"><strong>Notifications</strong><span>Browser notification preferences</span></div><ChevronRight size={18} className="muted-icon" /></div>
    <div className="settings-card"><div className="settings-icon"><CircleHelp size={21} /></div><div className="settings-copy"><strong>Help & support</strong><span>App information and support</span></div><ChevronRight size={18} className="muted-icon" /></div>
    <p className="settings-note">Backend integration will be enabled after the Supabase schema and Edge Function contracts are finalized.</p>
  </section>
}

function ChatDetailPage() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  return <div className="chat-detail">
    <header className="chat-header">
      <button className="icon-button" type="button" aria-label="Back to chats" onClick={() => navigate('/')}><ArrowLeft size={21} /></button>
      <div className="chat-avatar"><MessageCircle size={19} /></div>
      <div className="chat-header-copy"><strong>Conversation</strong><span>{chatId}</span></div>
      <button className="icon-button" type="button" aria-label="More options"><MoreHorizontal size={22} /></button>
    </header>
    <div className="chat-empty"><EmptyState icon={<MessageCircle size={27} />} title="Conversation not found" description="This conversation is not available yet. Connect the message data source to load chat history." /></div>
    <div className="composer-placeholder"><div className="composer-disabled"><span>Message</span><Plus size={20} /></div><button type="button" className="send-disabled" disabled aria-label="Send message"><CheckCheck size={19} /></button></div>
  </div>
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{description}</p></div>
}