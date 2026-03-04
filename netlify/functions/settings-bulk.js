import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD || "0901";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { password, settings } = JSON.parse(event.body);

    if (password !== adminPassword) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "비밀번호가 올바르지 않습니다." }),
      };
    }

    // Upsert settings
    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(upsertData, { onConflict: 'key' });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Settings bulk update error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "설정 저장 중 오류가 발생했습니다." }),
    };
  }
};
