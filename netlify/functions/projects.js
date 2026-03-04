import { createClient } from '@supabase/supabase-js';

const adminPassword = process.env.ADMIN_PASSWORD || "0901";

let supabaseInstance = null;
const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

export const handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-password",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const pathParts = event.path.split('/').filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  const id = (lastPart !== 'projects') ? lastPart : null;

  try {
    const supabase = getSupabase();
    // GET /api/projects
    if (event.httpMethod === "GET") {
      if (id) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('year', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data),
        };
      }
    }

    // POST /api/projects (Create or Update)
    if (event.httpMethod === "POST" || event.httpMethod === "PUT") {
      const body = JSON.parse(event.body);
      const { password, ...projectData } = body;

      if (password !== adminPassword && event.headers['x-password'] !== adminPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "비밀번호가 올바르지 않습니다." }),
        };
      }

      // Format data for Supabase
      const dataToSave = {
        ...projectData,
        video_urls: projectData.video_urls || [],
        images: projectData.images || [],
        equipment: projectData.equipment || {},
        is_featured: !!projectData.is_featured
      };

      let result;
      if (id || projectData.id) {
        const targetId = id || projectData.id;
        result = await supabase
          .from('projects')
          .update(dataToSave)
          .eq('id', targetId);
      } else {
        result = await supabase
          .from('projects')
          .insert([dataToSave]);
      }

      if (result.error) throw result.error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: result.data?.[0]?.id }),
      };
    }

    // DELETE /api/projects/:id
    if (event.httpMethod === "DELETE") {
      const password = event.headers['x-password'];
      if (password !== adminPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "비밀번호가 올바르지 않습니다." }),
        };
      }

      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing project ID" }) };
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  } catch (error) {
    console.error("Projects function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "프로젝트 처리 중 오류가 발생했습니다." }),
    };
  }
};
