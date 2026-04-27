import * as crypto from "node:crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const PIXEL_TOKEN = process.env.META_PIXEL_ACCESS_TOKEN;
const PAGE_ID = process.env.META_PAGE_ID;
const API_VERSION = process.env.META_API_VERSION || "v21.0";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaLeadEvent {
  phone: string;
  city?: string | null;
  state?: string | null;
  /** ID do lead no FROTA10K — usado para deduplicação na Meta */
  leadId?: string;
  /** Click-to-WhatsApp Click ID. Quando ausente, usa modo fallback (system_generated). */
  ctwaClid?: string | null;
}

/**
 * Envia evento de Lead/LeadSubmitted para a Conversions API.
 * Modos:
 *   - ctwa     -> action_source=business_messaging + ctwa_clid (atribuição precisa)
 *   - fallback -> action_source=system_generated (sem clid; ainda otimiza Pixel)
 *
 * Não lança em caso de falha — apenas loga. CAPI é fire-and-forget;
 * uma falha no tracking nunca deve quebrar o fluxo de criação do lead.
 */
export async function sendMetaLeadEvent(lead: MetaLeadEvent): Promise<void> {
  if (!PIXEL_ID || !PIXEL_TOKEN) {
    console.log("[CAPI] Desabilitado (META_PIXEL_ID ou META_PIXEL_ACCESS_TOKEN ausentes)");
    return;
  }

  const eventId = lead.leadId ?? crypto.randomUUID();
  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

  const baseUserData: Record<string, unknown> = {
    ph: [hash(lead.phone.replace(/\D/g, ""))],
    country: [hash("br")],
    ...(lead.city && { ct: [hash(lead.city)] }),
    ...(lead.state && { st: [hash(lead.state)] }),
  };

  let event: Record<string, unknown>;
  if (lead.ctwaClid && PAGE_ID) {
    event = {
      event_name: "LeadSubmitted",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "business_messaging",
      messaging_channel: "whatsapp",
      user_data: { ...baseUserData, page_id: PAGE_ID, ctwa_clid: lead.ctwaClid },
    };
  } else {
    event = {
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "system_generated",
      user_data: baseUserData,
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: PIXEL_TOKEN }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.log(`[CAPI] erro ${res.status}: ${JSON.stringify(body)}`);
      return;
    }
    const mode = lead.ctwaClid ? "ctwa" : "fallback";
    console.log(`[CAPI] OK (${mode}) event_id=${eventId} received=${body.events_received}`);
  } catch (err) {
    console.log(`[CAPI] falha: ${(err as Error).message}`);
  }
}
