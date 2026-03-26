/**
 * Supabase Edge Function: check-in-monitor
 * 
 * Esta función debe ejecutarse periódicamente (Cron Job) para verificar
 * temporizadores expirados y disparar alertas SOS.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()

    // 1. Buscar check-ins activos que ya expiraron
    const { data: expiredCheckins, error: fetchError } = await supabase
      .from('pending_checkins')
      .select('id, user_id')
      .eq('is_active', true)
      .lt('estimated_arrival_time', now)

    if (fetchError) throw fetchError

    if (!expiredCheckins || expiredCheckins.length === 0) {
      return new Response(JSON.stringify({ message: 'No expired check-ins found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Para cada check-in expirado, disparar alerta SOS
    for (const checkin of expiredCheckins) {
      // Insertar alerta SOS automática
      await supabase.from('alerts').insert([
        { 
          user_id: checkin.user_id, 
          type: 'SOS_AUTOMATIC_CHECKIN_EXPIRED',
          created_at: now
        }
      ])

      // Marcar check-in como procesado/inactivo
      await supabase
        .from('pending_checkins')
        .update({ is_active: false })
        .eq('id', checkin.id)
    }

    return new Response(JSON.stringify({ processed: expiredCheckins.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
