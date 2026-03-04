import { createClient } from '@supabase/supabase-js';

const adminPassword = process.env.ADMIN_PASSWORD || "0901";

let supabaseInstance = null;
const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url && !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing in Netlify settings.");
  if (!url) throw new Error("SUPABASE_URL is missing in Netlify settings.");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in Netlify settings.");
  
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

export const handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-password",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    let bodyText = event.body;
    if (event.isBase64Encoded) {
      bodyText = Buffer.from(event.body, 'base64').toString('utf-8');
    }

    if (!bodyText) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "요청 본문이 비어 있습니다." }) };
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "유효하지 않은 JSON 형식입니다." }) };
    }

    const { password, settings } = body;

    if (password !== adminPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "비밀번호가 올바르지 않습니다." }) };
    }

    if (!settings || typeof settings !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "설정 데이터가 올바르지 않습니다." }) };
    }

    const supabase = getSupabase();
    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(upsertData, { onConflict: 'key' });

    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error("Settings bulk update error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: `서버 오류: ${error.message}` }) };
  }
};
