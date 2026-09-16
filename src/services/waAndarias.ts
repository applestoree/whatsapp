import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jhpbtooefyzdndstlzva.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HlbyFAF2Eyck6G84vBzaZw_TjAa39_d'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export type WaAndariasRow = {
  wa_message_id: string
  chat_id: string | null
  agent_name: string | null
  first_name: string | null
  label_names: string | null
  user_message: unknown
  subscriber_id: string | null
  whatsapp_bot_id: string | null
  whatsapp_bot_name: string | null
  whatsapp_bot_username: string | null
  status_time: string | null
  webhook_type: string | null
  failed_reason: string | null
  message_status: string | null
  created_at: string
}

export async function fetchWaAndarias(): Promise<WaAndariasRow[]> {
  const { data, error } = await supabase
    .from('wa_andarias')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export function subscribeToWaAndarias(
  onInsert: (row: WaAndariasRow) => void,
  onUpdate: (row: WaAndariasRow) => void,
  onDelete: (row: WaAndariasRow) => void,
) {
  const channel = supabase
    .channel('wa-andarias-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'wa_andarias' },
      (payload) => onInsert(payload.new as WaAndariasRow),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'wa_andarias' },
      (payload) => onUpdate(payload.new as WaAndariasRow),
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'wa_andarias' },
      (payload) => onDelete(payload.old as WaAndariasRow),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
