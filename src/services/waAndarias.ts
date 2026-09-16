import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const WA_ANDARIAS_ENDPOINT =
  'https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/get-wa-andarias'

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

export function subscribeToWaAndarias(
  onChange: (payload: RealtimePostgresChangesPayload<WaAndariasRow>) => void,
) {
  const channel = supabase
    .channel('wa-andarias-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wa_andarias',
      },
      onChange,
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
