import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

console.log(`[SERVER] Starting in ${isProd ? 'production' : 'development'} mode`);
console.log(`[SERVER] Database path: ${path.join(__dirname, "portfolio.db")}`);

const db = new Database(path.join(__dirname, "portfolio.db"));

// Check if database is writable
try {
  db.exec("PRAGMA journal_mode = DELETE"); // Use standard delete mode for better persistence in some environments
  db.exec("PRAGMA synchronous = FULL");
  db.exec("CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY)");
  db.exec("DROP TABLE _write_test");
  console.log("[SERVER] Database is writable and persistence is configured");
} catch (e) {
  console.error("[SERVER] Database is NOT writable. Persistence will fail on this platform.", e);
}

try {
  // Initialize database
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      year TEXT NOT NULL,
      thumbnail TEXT,
      description TEXT,
      intent TEXT,
      technical TEXT,
      environment TEXT,
      role TEXT,
      video_urls TEXT, -- JSON array of {label, url}
      images TEXT, -- JSON array of strings
      equipment TEXT, -- JSON object
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
} catch (e) {
  console.error("Database initialization failed:", e);
}

// Seed default resume if not exists
const resumeExists = db.prepare("SELECT 1 FROM settings WHERE key = 'resume_url'").get();
if (!resumeExists) {
  const settings = [
    ['resume_url', '/resume.pdf'],
    ['site_name', '구성민'],
    ['site_role', 'Cinematographer'],
    ['site_intro', '감정과 공간을 설계하는 촬영감독입니다.'],
    ['about_intro', '빛과 그림자, 그리고 그 사이의 공간이 만들어내는 감정에 매료되어 촬영을 시작했습니다. 카메라 렌즈를 통해 세상을 바라보는 것은 단순히 기록하는 행위를 넘어, 이야기의 본질을 시각적 언어로 번역하는 과정이라 믿습니다.\n\n저는 인물과 카메라 사이의 거리감, 조명이 만들어내는 리듬, 그리고 프레임 안의 정적을 중요하게 생각합니다. 기술적인 완벽함보다 작품이 전달하고자 하는 감정의 온도를 정확하게 포착하는 것에 집중합니다.\n\n앞으로도 진정성 있는 시선으로 관객의 마음을 움직이는 이미지를 설계해 나가겠습니다.'],
    ['about_page_title', 'ABOUT'],
    ['about_name', '구성민'],
    ['about_intro_label', '감독 소개'],
    ['about_services_label', '가능 업무 범위'],
    ['about_experience_label', '경력'],
    ['about_image', 'https://picsum.photos/seed/director/600/800'],
    ['about_services', JSON.stringify([
      { title: "촬영 (Cinematography)", desc: "Main" },
      { title: "조명 설계 (Lighting Design)", desc: "Expert" },
      { title: "색보정 (Color Grading)", desc: "DaVinci Resolve" },
      { title: "프리프로덕션 콘셉트 설계", desc: "Visual Planning" }
    ])],
    ['about_experience', JSON.stringify([
      { year: "2025", title: "독립 단편영화 '그림자의 온도'", role: "촬영감독" },
      { year: "2024", title: "브랜드 다큐멘터리 '장인의 손길'", role: "촬영 및 색보정" },
      { year: "2024", title: "뮤직비디오 '새벽의 끝'", role: "조명감독" },
      { year: "2023", title: "실험영상 '도시의 소음'", role: "제27회 대학영화제 촬영상 수상" }
    ])],
    ['equipment_desc', '작품의 톤과 매너에 가장 적합한 장비를 선택하여 최상의 결과물을 만들어냅니다. Sony Alpha 시스템 기반의 S-Log3 / S-Cinetone 운용에 능숙합니다.'],
    ['contact_intro', '프로젝트 제안이나 협업 문의는 아래 연락처로 부탁드립니다. 보통 24시간 이내에 답변을 드립니다.'],
    ['contact_email', 'j66422069@gmail.com'],
    ['contact_phone', '010-1234-5678'],
    ['contact_instagram', '@sungmin_cinematography'],
    ['contact_instagram_url', '#'],
    ['project_title', 'PROJECTS'],
    ['project_desc', '상업 광고, 뮤직비디오, 단편 영화 등 다양한 장르의 촬영 결과물입니다.'],
    ['project_role_label', '역할'],
    ['project_equipment_label', '사용 장비'],
    ['project_camera_label', 'Camera'],
    ['project_lens_label', 'Lens'],
    ['project_lighting_label', 'Lighting'],
    ['project_color_label', 'Color'],
    ['project_back_label', 'BACK TO LIST'],
    ['project_desc_label', '작품 개요'],
    ['project_intent_label', '촬영 의도'],
    ['project_tech_label', '기술적 접근'],
    ['project_env_label', '촬영 환경 / 세팅'],
    ['equipment_page_title', 'EQUIPMENT'],
    ['equipment_page_subtitle', '보유 및 운용 장비'],
    ['equipment_list', JSON.stringify([
      {
        category: "CAMERA",
        items: [
          { name: "Sony Alpha 7 IV", desc: "Main Body / 4K 10-bit 4:2:2" },
          { name: "Sony Alpha 7S III", desc: "Low-light / High Speed Body" },
          { name: "Blackmagic Video Assist 7\"", desc: "External Monitor & Recorder" },
        ]
      },
      {
        category: "LENS",
        items: [
          { name: "Sigma 24-70mm F2.8 DG DN Art", desc: "Main Zoom" },
          { name: "Sony FE 35mm F1.4 GM", desc: "Prime / Narrative" },
          { name: "Sony FE 50mm F1.2 GM", desc: "Prime / Portrait" },
          { name: "Sony FE 85mm F1.8", desc: "Prime / Telephoto" },
        ]
      },
      {
        category: "LIGHTING",
        items: [
          { name: "Aputure LS 300d II", desc: "Main Key Light" },
          { name: "Godox SL60W", desc: "Sub Light" },
          { name: "Nanlite Pavotube II 6C", desc: "RGB Effect Light" },
          { name: "Various Modifiers", desc: "Softbox, Grid, Reflector" },
        ]
      },
      {
        category: "POST-PRODUCTION",
        items: [
          { name: "DaVinci Resolve Studio", desc: "Main Color Grading Tool" },
          { name: "Adobe Premiere Pro", desc: "Editing Tool" },
          { name: "Dehancer Pro", desc: "Film Emulation Plugin" },
        ]
      }
    ])]
  ];
  const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  settings.forEach(([key, value]) => insert.run(key, value));
}

// Seed sample data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO projects (title, type, year, thumbnail, description, intent, technical, environment, role, video_urls, images, equipment, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "그림자의 온도",
    "독립 단편영화",
    "2025",
    "https://picsum.photos/seed/shadow/800/450",
    "도시의 소외된 이면을 다룬 단편영화입니다.",
    "낮은 콘트라스트와 차가운 블루 톤을 통해 고독을 표현하고자 했습니다.",
    "S-Log3 촬영 후 DaVinci Resolve로 필름 에뮬레이션 작업을 진행했습니다.",
    "야간 도심 및 실내 세트",
    "촬영감독",
    JSON.stringify([{ label: "본편", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }]),
    JSON.stringify(["https://picsum.photos/seed/still1/800/450", "https://picsum.photos/seed/still2/800/450"]),
    JSON.stringify({ camera: "Sony A7M4", lens: "Sigma 24-70mm F2.8", lighting: "Godox SL60W", color: "DaVinci Resolve" }),
    1
  );

  insert.run(
    "장인의 손길",
    "브랜드 다큐멘터리",
    "2024",
    "https://picsum.photos/seed/craft/800/450",
    "전통 공예 장인의 일상을 담은 다큐멘터리입니다.",
    "따뜻한 웜톤과 클로즈업 샷을 통해 장인의 열정을 강조했습니다.",
    "자연광을 최대한 활용하여 인위적인 느낌을 배제했습니다.",
    "전통 공방",
    "촬영 및 색보정",
    JSON.stringify([{ label: "본편", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }]),
    JSON.stringify(["https://picsum.photos/seed/still3/800/450"]),
    JSON.stringify({ camera: "Sony A7S3", lens: "Sony 50mm F1.2 GM", lighting: "Natural Light", color: "DaVinci Resolve" }),
    1
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Disable caching for all API routes
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY year DESC, created_at DESC").all();
    res.json(projects.map(p => ({
      ...p,
      video_urls: JSON.parse(p.video_urls || "[]"),
      images: JSON.parse(p.images || "[]"),
      equipment: JSON.parse(p.equipment || "{}")
    })));
  });

  app.get("/api/projects/featured", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects WHERE is_featured = 1 LIMIT 4").all();
    res.json(projects.map(p => ({
      ...p,
      video_urls: JSON.parse(p.video_urls || "[]"),
      images: JSON.parse(p.images || "[]"),
      equipment: JSON.parse(p.equipment || "{}")
    })));
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({
      ...project,
      video_urls: JSON.parse(project.video_urls || "[]"),
      images: JSON.parse(project.images || "[]"),
      equipment: JSON.parse(project.equipment || "{}")
    });
  });

  app.post("/api/projects", (req, res) => {
    try {
      const { password, ...project } = req.body;
      console.log(`[POST] Creating new project: ${project.title}`);
      
      if (password !== "0901") {
        console.warn("[POST] Unauthorized project creation attempt");
        return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
      }

      const stmt = db.prepare(`
        INSERT INTO projects (title, type, year, thumbnail, description, intent, technical, environment, role, video_urls, images, equipment, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        project.title,
        project.type,
        project.year,
        project.thumbnail,
        project.description,
        project.intent,
        project.technical,
        project.environment,
        project.role,
        JSON.stringify(project.video_urls || []),
        JSON.stringify(project.images || []),
        JSON.stringify(project.equipment || {}),
        project.is_featured ? 1 : 0
      );

      console.log(`[POST] Project created successfully with ID: ${result.lastInsertRowid}`);
      const count = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
      console.log(`[POST] Total projects in DB now: ${count.count}`);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("[POST] Project creation error:", error);
      res.status(500).json({ error: "프로젝트 생성 중 서버 오류가 발생했습니다." });
    }
  });

  app.put("/api/projects/:id", (req, res) => {
    try {
      const { password, ...project } = req.body;
      const { id } = req.params;
      const numericId = Number(id);
      
      console.log(`[PUT] Updating project ID: ${id} (${project.title})`);
      
      if (password !== "0901") {
        console.warn(`[PUT] Unauthorized update attempt for project ${id}`);
        return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
      }

      if (isNaN(numericId)) {
        return res.status(400).json({ error: "유효하지 않은 프로젝트 ID입니다." });
      }

      const stmt = db.prepare(`
        UPDATE projects SET 
          title = ?, type = ?, year = ?, thumbnail = ?, description = ?, 
          intent = ?, technical = ?, environment = ?, role = ?, 
          video_urls = ?, images = ?, equipment = ?, is_featured = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        project.title,
        project.type,
        project.year,
        project.thumbnail,
        project.description,
        project.intent,
        project.technical,
        project.environment,
        project.role,
        JSON.stringify(project.video_urls || []),
        JSON.stringify(project.images || []),
        JSON.stringify(project.equipment || {}),
        project.is_featured ? 1 : 0,
        numericId
      );

      if (result.changes === 0) {
        console.warn(`[PUT] No project found to update with ID ${numericId}`);
        return res.status(404).json({ error: "업데이트할 프로젝트를 찾을 수 없습니다." });
      }

      console.log(`[PUT] Project ${numericId} updated successfully`);
      const updated = db.prepare("SELECT title FROM projects WHERE id = ?").get(numericId) as { title: string };
      console.log(`[PUT] Verified title in DB: ${updated.title}`);
      res.json({ success: true });
    } catch (error) {
      console.error(`[PUT] Project update error for ID ${req.params.id}:`, error);
      res.status(500).json({ error: "프로젝트 업데이트 중 서버 오류가 발생했습니다." });
    }
  });

  app.delete("/api/projects/:id", (req, res) => {
    const password = req.headers['x-password'];
    const { id } = req.params;
    const numericId = Number(id);
    
    console.log(`[DELETE] Request received for project ID: ${id} (numeric: ${numericId})`);
    console.log(`[DELETE] Password provided in header: ${password ? "****" : "MISSING"}`);
    
    if (password !== "0901") {
      console.warn(`[DELETE] Unauthorized attempt for project ${id}`);
      return res.status(401).json({ error: "비밀번호가 올바르지 않습니다. (Unauthorized)" });
    }

    if (isNaN(numericId)) {
      console.error(`[DELETE] Invalid ID format: ${id}`);
      return res.status(400).json({ error: "유효하지 않은 프로젝트 ID입니다." });
    }

    try {
      const result = db.prepare("DELETE FROM projects WHERE id = ?").run(numericId);
      console.log(`[DELETE] DB Result for project ${numericId}:`, result);
      
      if (result.changes === 0) {
        console.warn(`[DELETE] No project found with ID ${numericId}`);
        return res.status(404).json({ error: "삭제할 프로젝트를 찾을 수 없습니다." });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`[DELETE] Database error for project ${numericId}:`, error);
      res.status(500).json({ error: "데이터베이스 삭제 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT key, value FROM settings").all() as { key: string, value: string }[];
    const settingsObj = settings.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    res.json(settingsObj);
  });

  app.get("/api/settings/:key", (req, res) => {
    const setting = db.prepare("SELECT value FROM settings WHERE key = ?").get(req.params.key) as { value: string } | undefined;
    res.json({ value: setting?.value || "" });
  });

  app.post("/api/settings/bulk", (req, res) => {
    try {
      const { password, settings } = req.body;
      console.log("[POST] Bulk settings update request");
      
      if (password !== "0901") {
        console.warn("[POST] Unauthorized bulk settings update attempt");
        return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
      }

      const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      const transaction = db.transaction((settingsObj) => {
        for (const [key, value] of Object.entries(settingsObj)) {
          stmt.run(key, value);
        }
      });

      transaction(settings);
      console.log("[POST] Bulk settings updated successfully");
      res.json({ success: true });
    } catch (error) {
      console.error("[POST] Bulk settings update error:", error);
      res.status(500).json({ error: "설정 저장 중 서버 오류가 발생했습니다." });
    }
  });

  app.post("/api/settings/:key", (req, res) => {
    try {
      const { password, value } = req.body;
      const { key } = req.params;
      console.log(`[POST] Updating setting: ${key}`);
      
      if (password !== "0901") {
        console.warn(`[POST] Unauthorized setting update attempt for ${key}`);
        return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
      }

      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
      console.log(`[POST] Setting ${key} updated successfully`);
      res.json({ success: true });
    } catch (error) {
      console.error(`[POST] Setting update error for ${req.params.key}:`, error);
      res.status(500).json({ error: "설정 업데이트 중 서버 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";
  
  if (!isProd) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Failed to start Vite dev server, falling back to static mode:", e);
      app.use(express.static(path.join(__dirname, "dist")));
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical failure during server startup:", err);
  process.exit(1);
});
