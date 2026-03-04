import { createClient } from '@supabase/supabase-js';

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
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const supabase = getSupabase();
    const pathParts = event.path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const key = (lastPart !== 'settings') ? lastPart : null;

    if (key && key !== 'settings') {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ value: data?.value || "" }),
      };
    } else {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');
      
      if (error) throw error;

      const settingsObj = data.reduce((acc, { key, value }) => {
        try {
          // Try to parse JSON if it looks like JSON
          if (value && (value.startsWith('[') || value.startsWith('{'))) {
            acc[key] = JSON.parse(value);
          } else {
            acc[key] = value;
          }
        } catch (e) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settingsObj),
      };
    }
  } catch (error) {
    console.error("Settings fetch error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `설정을 불러오는 중 오류가 발생했습니다: ${error.message}` }),
    };
  }
};
