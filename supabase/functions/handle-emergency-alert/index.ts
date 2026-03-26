/**
 * Supabase Edge Function: handle-emergency-alert
 * 
 * Esta función se dispara mediante un Database Webhook cuando se inserta 
 * una nueva fila en la tabla 'alerts'.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS para pre-flight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente de Supabase con Service Role para bypass de RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el registro insertado desde el webhook
    const payload = await req.json()
    const { record } = payload
    
    if (!record || !record.user_id) {
      throw new Error('Payload inválido: Falta el registro o el user_id')
    }

    const { user_id, type } = record

    // 1. Obtener Perfil del Usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user_id)
      .single()

    if (profileError) console.error('Error obteniendo perfil:', profileError)
    const userName = profile?.full_name || 'Un usuario'

    // 2. Obtener Contactos de Emergencia
    const { data: contacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('phone_number, expo_push_token')
      .eq('user_id', user_id)

    if (contactsError) throw contactsError
    if (!contacts || contacts.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay contactos de emergencia configurados' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. Obtener Última Ubicación Conocida
    const { data: location } = await supabase
      .from('location_tracking')
      .select('latitude, longitude')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const lat = location?.latitude || 0
    const lon = location?.longitude || 0
    const mapUrl = `https://maps.google.com/?q=${lat},${lon}`

    // Definir Mensajes
    const isSilent = type === 'silent'
    const smsBody = isSilent 
      ? `Atención: ${userName} ha ingresado su código de alerta silenciosa. Monitoreo discreto activado. Ubicación: ${mapUrl}`
      : `ALERTA SOS MONTERREY: ${userName} está en peligro. Ubicación: ${mapUrl}`
    
    const pushTitle = isSilent ? '⚠️ ALERTA DISCRETA' : '🚨 EMERGENCIA SOS MONTERREY'
    const pushBody = isSilent 
      ? `Protocolo de monitoreo silencioso activado para ${userName}.`
      : `${userName} activó su botón de pánico.`

    // --- INTEGRACIÓN EXPO PUSH ---
    const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN')
    const pushTokens = contacts.map(c => c.expo_push_token).filter(Boolean)

    if (pushTokens.length > 0 && expoToken) {
      try {
        const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${expoToken}`
          },
          body: JSON.stringify(pushTokens.map(token => ({
            to: token,
            title: pushTitle,
            body: pushBody,
            sound: 'default', // En la app se configura el canal 'emergency' con sonido de sirena
            priority: 'high',
            data: { url: mapUrl, type: 'SOS_ALERT' },
            channelId: 'emergency-alerts'
          })))
        })
        const pushData = await pushResponse.json()
        console.log('Push notifications enviadas:', pushData)
      } catch (err) {
        console.error('Error enviando notificaciones push:', err)
      }
    }

    // --- INTEGRACIÓN TWILIO SMS ---
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (twilioSid && twilioToken && twilioFrom) {
      const smsPromises = contacts.map(async (contact) => {
        const to = contact.phone_number
        // Validación básica de formato E.164
        if (!to || !/^\+[1-9]\d{1,14}$/.test(to)) {
          console.warn(`Número de teléfono inválido omitido: ${to}`)
          return
        }

        try {
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: to,
              From: twilioFrom,
              Body: smsBody
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(`Fallo envío SMS a ${to}:`, errorData.message)
          } else {
            console.log(`SMS enviado exitosamente a ${to}`)
          }
        } catch (err) {
          console.error(`Error de red enviando SMS a ${to}:`, err)
        }
      })

      // Ejecutar todos los envíos de SMS en paralelo, manejando fallos individuales
      await Promise.all(smsPromises)
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('Error crítico en handle-emergency-alert:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
