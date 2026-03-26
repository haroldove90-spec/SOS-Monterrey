/**
 * Supabase Edge Function: send-alert
 * Este archivo debe desplegarse en Supabase Functions.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // El payload viene del Trigger de la tabla 'alerts'
    const { record } = await req.json()
    const { user_id, type, evidence_url } = record

    if (type !== 'SOS_ACTIVATED') {
      return new Response(JSON.stringify({ message: 'Not an SOS alert' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 1. Obtener datos del usuario y sus contactos de confianza
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', user_id)
      .single()

    const { data: contacts } = await supabaseClient
      .from('emergency_contacts')
      .select('phone_number, expo_push_token')
      .eq('user_id', user_id)

    // 2. Obtener última ubicación
    const { data: lastLocation } = await supabaseClient
      .from('location_tracking')
      .select('latitude, longitude')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const lat = lastLocation?.latitude || 0
    const lon = lastLocation?.longitude || 0
    const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`
    
    let messageText = `¡EMERGENCIA! ${userProfile?.full_name || 'Un usuario'} ha activado SOS Monterrey en [${lat}, ${lon}]. Sigue su ubicación aquí: ${mapUrl}`
    let pushTitle = '🚨 EMERGENCIA SOS MONTERREY'
    let pushBody = `${userProfile?.full_name} necesita ayuda inmediata.`

    if (type === 'silent') {
      messageText = `Atención: ${userProfile?.full_name} ha ingresado su código de alerta silenciosa. Monitoreo discreto activado. Ubicación: ${mapUrl}`
      pushTitle = '⚠️ ALERTA DISCRETA'
      pushBody = `Protocolo de monitoreo silencioso activado para ${userProfile?.full_name}.`
    }

    // 3. Enviar Notificaciones Push vía Expo
    const pushTokens = contacts?.map(c => c.expo_push_token).filter(Boolean) || []
    if (pushTokens.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`
        },
        body: JSON.stringify(pushTokens.map(token => ({
          to: token,
          sound: 'default',
          title: pushTitle,
          body: pushBody,
          data: { url: mapUrl, type: 'SOS_ALERT' },
          priority: 'high',
          channelId: 'emergency-alerts'
        })))
      })
    }

    // 4. Fallback SMS vía Twilio
    const phoneNumbers = contacts?.map(c => c.phone_number).filter(n => /^\+[1-9]\d{1,14}$/.test(n)) || []
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER')

    for (const phone of phoneNumbers) {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioFrom!,
          Body: messageText
        })
      })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
