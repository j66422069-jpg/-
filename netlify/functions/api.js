exports.handler = async (event, context) => {
  console.log(`[FUNCTION START] Method: ${event.httpMethod}, Path: ${event.path}`);
  
  const API_BASE_URL = process.env.API_BASE_URL || "https://ais-pre-gclbci65rben43vqbxvfve-135154747457.asia-northeast1.run.app";
  
  let apiPath = event.path;
  if (apiPath.includes("/.netlify/functions/api")) {
    apiPath = apiPath.replace("/.netlify/functions/api", "");
  }
  
  if (!apiPath.startsWith("/api")) {
    apiPath = "/api" + (apiPath.startsWith("/") ? apiPath : "/" + apiPath);
  }

  const url = `${API_BASE_URL}${apiPath}${event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0 ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''}`;

  console.log(`[PROXY TARGET] ${url}`);

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-password",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const headers = {};
    for (const [key, value] of Object.entries(event.headers)) {
      if (value && !['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    headers["host"] = new URL(API_BASE_URL).host;

    const body = event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : event.body;

    const response = await fetch(url, {
      method: event.httpMethod,
      headers: headers,
      body: event.httpMethod !== "GET" && event.httpMethod !== "HEAD" ? body : undefined,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-password",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: data,
    };
  } catch (error) {
    console.error("[PROXY ERROR]", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to proxy request to backend" }),
    };
  }
};
