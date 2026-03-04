import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Use the Shared App URL as the base for the proxy target
  // This URL is public and persistent compared to the dev URL
  const API_BASE_URL = process.env.API_BASE_URL || "https://ais-pre-gclbci65rben43vqbxvfve-135154747457.asia-northeast1.run.app";
  
  const path = event.path.replace("/api", "");
  const url = `${API_BASE_URL}/api${path}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters as any).toString() : ''}`;

  console.log(`[PROXY] ${event.httpMethod} ${url}`);

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
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        "host": new URL(API_BASE_URL).host,
      } as any,
      body: event.body,
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
