import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler = async (event, context) => {
  try {
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsObj),
      };
    }
  } catch (error) {
    console.error("Settings fetch error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "설정을 불러오는 중 오류가 발생했습니다." }),
    };
  }
};
