import React, { useState, useEffect } from "react";
import { Project, VideoUrl } from "../types";
import { Plus, Trash2, Edit2, X, Save } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [siteContent, setSiteContent] = useState({
    site_name: "",
    site_role: "",
    site_intro: "",
    about_intro: "",
    about_page_title: "",
    about_name: "",
    about_intro_label: "",
    about_services_label: "",
    about_experience_label: "",
    about_image: "",
    about_services: "[]",
    about_experience: "[]",
    equipment_desc: "",
    equipment_page_title: "",
    equipment_page_subtitle: "",
    equipment_list: "[]",
    contact_intro: "",
    contact_email: "",
    contact_phone: "",
    contact_instagram: "",
    contact_instagram_url: "",
    project_title: "",
    project_desc: "",
    project_role_label: "",
    project_equipment_label: "",
    project_camera_label: "",
    project_lens_label: "",
    project_lighting_label: "",
    project_color_label: "",
    project_back_label: "",
    project_desc_label: "",
    project_intent_label: "",
    project_tech_label: "",
    project_env_label: ""
  });
  const [activeTab, setActiveTab] = useState("HOME");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
      fetchResumeUrl();
      fetchSiteContent();
    }
  }, [isLoggedIn]);

  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setProjects(data);
      console.log("[ADMIN] Projects refetched:", data.length);
    } catch (error) {
      console.error("[ADMIN] Fetch projects error:", error);
      throw error;
    }
  };

  const fetchResumeUrl = async () => {
    try {
      const res = await fetch(`/api/settings/resume_url?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setResumeUrl(data.value);
    } catch (error) {
      console.error("[ADMIN] Fetch resume error:", error);
      throw error;
    }
  };

  const fetchSiteContent = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setSiteContent(prev => ({ ...prev, ...data }));
      console.log("[ADMIN] Site content refetched");
    } catch (error) {
      console.error("Fetch site content error:", error);
      throw error;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "0901") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("비밀번호가 틀렸습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (id === undefined || id === null) {
      console.error("[ADMIN] Cannot delete project: ID is missing");
      alert("프로젝트 ID가 유효하지 않습니다.");
      return;
    }

    console.log(`[ADMIN] Deleting project with ID: ${id}`);
    if (!confirm(`정말 삭제하시겠습니까? (ID: ${id})`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "x-password": password 
        }
      });

      console.log(`[ADMIN] Delete response status: ${res.status}`);

      if (res.ok) {
        alert("프로젝트가 삭제되었습니다.");
        fetchProjects();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error(`[ADMIN] Delete failed:`, errorData);
        alert(`삭제에 실패했습니다: ${errorData.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("[ADMIN] Delete error:", error);
      alert("삭제 중 서버와 통신하는 동안 오류가 발생했습니다.");
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000; // Reduced for Netlify 6MB limit
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG
        };
      };
    });
  };

  const handleUpdateResume = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/resume_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ password, value: resumeUrl }),
      });
      if (res.ok) {
        await fetchResumeUrl();
        alert("이력서 URL이 성공적으로 업데이트되었습니다.");
      } else {
        let errorMessage = "알 수 없는 오류";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `서버 오류 (${res.status}: ${res.statusText})`;
        }
        console.error("[ADMIN] Resume update failed:", errorMessage);
        alert(`업데이트에 실패했습니다: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Resume update error:", error);
      alert("업데이트 중 서버와 통신하는 동안 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllContent = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ password, settings: siteContent }),
      });
      
      if (res.ok) {
        await fetchSiteContent();
        alert("모든 사이트 텍스트가 성공적으로 저장되었습니다.");
      } else {
        const errorText = await res.text();
        let errorMessage = `서버 오류 (${res.status})`;
        try {
          const data = JSON.parse(errorText);
          errorMessage = data.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        console.error("[ADMIN] Save bulk settings failed:", errorMessage);
        alert(`저장에 실패했습니다: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const isUpdate = !!editingProject?.id;
      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate ? `/api/projects/${editingProject.id}` : "/api/projects";

      console.log(`[ADMIN] ${isUpdate ? 'Updating' : 'Creating'} project...`);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ ...editingProject, password }),
      });

      if (res.ok) {
        console.log("[ADMIN] Project saved successfully on server");
        await fetchProjects();
        setEditingProject(null);
        alert("프로젝트가 성공적으로 저장되었습니다.");
      } else {
        const errorText = await res.text();
        let errorMessage = `서버 오류 (${res.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        console.error("[ADMIN] Project save failed:", errorMessage);
        alert(`저장에 실패했습니다: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Project save error:", error);
      alert("저장 중 서버와 통신하는 동안 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-6 py-32">
        <h1 className="text-2xl font-bold mb-8 text-center">ADMIN LOGIN</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button className="w-full py-3 bg-black text-white font-medium">로그인</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">관리자 페이지</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-6 py-2 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
          <button
            onClick={() => setEditingProject({
              title: "", type: "", year: new Date().getFullYear().toString(),
              thumbnail: "", description: "", intent: "", technical: "",
              environment: "", role: "", video_urls: [], images: [],
              equipment: { camera: "", lens: "", lighting: "", color: "" },
              is_featured: false
            })}
            className="px-6 py-2 bg-black text-white text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> 프로젝트 추가
          </button>
        </div>
      </div>

      <section className="mb-16 p-8 border border-gray-100 bg-gray-50">
        <h2 className="text-xl font-bold mb-6">이력서 관리</h2>
        <form onSubmit={handleUpdateResume} className="flex gap-4 items-end">
          <div className="flex-grow space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">이력서 파일 URL (PDF 등)</label>
            <input
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://example.com/resume.pdf"
              className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black bg-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-8 py-2 bg-black text-white text-sm font-medium flex items-center gap-2 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            <Save size={16} className={isSaving ? 'animate-pulse' : ''} /> 
            {isSaving ? "저장 중..." : "업데이트"}
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-400">
          * 구글 드라이브나 외부 스토리지에 올린 파일의 공개 링크를 입력해주세요.
        </p>
      </section>

      <section className="mb-16 p-8 border border-gray-100 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-6">사이트 텍스트 관리</h2>
        
        <div className="flex gap-2 mb-8 border-b border-gray-100">
          {["HOME", "ABOUT", "PROJECT", "EQUIPMENT", "CONTACT"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-bold tracking-widest transition-all ${
                activeTab === tab ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSaveAllContent} className="space-y-8">
          {activeTab === "HOME" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">이름 (Site Name)</label>
                  <input
                    value={siteContent.site_name}
                    onChange={(e) => setSiteContent({ ...siteContent, site_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">직함 (Role)</label>
                  <input
                    value={siteContent.site_role}
                    onChange={(e) => setSiteContent({ ...siteContent, site_role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">메인 한 줄 소개 (Intro)</label>
                <input
                  value={siteContent.site_intro}
                  onChange={(e) => setSiteContent({ ...siteContent, site_intro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          {activeTab === "ABOUT" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">페이지 제목 (예: ABOUT)</label>
                  <input
                    value={siteContent.about_page_title}
                    onChange={(e) => setSiteContent({ ...siteContent, about_page_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">감독 이름 (ABOUT 페이지용)</label>
                  <input
                    value={siteContent.about_name}
                    onChange={(e) => setSiteContent({ ...siteContent, about_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">감독 소개 섹션 제목</label>
                <input
                  value={siteContent.about_intro_label}
                  onChange={(e) => setSiteContent({ ...siteContent, about_intro_label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">감독 소개글</label>
                <textarea
                  rows={10}
                  value={siteContent.about_intro}
                  onChange={(e) => setSiteContent({ ...siteContent, about_intro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">업무 범위 섹션 제목</label>
                <input
                  value={siteContent.about_services_label}
                  onChange={(e) => setSiteContent({ ...siteContent, about_services_label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">가능 업무 범위</label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = JSON.parse(siteContent.about_services || "[]");
                      setSiteContent({ ...siteContent, about_services: JSON.stringify([...current, { title: "", desc: "" }]) });
                    }}
                    className="text-xs font-bold text-blue-500"
                  >
                    + 추가
                  </button>
                </div>
                {JSON.parse(siteContent.about_services || "[]").map((service: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      placeholder="업무명 (예: 촬영)"
                      value={service.title}
                      onChange={(e) => {
                        const current = JSON.parse(siteContent.about_services || "[]");
                        current[idx].title = e.target.value;
                        setSiteContent({ ...siteContent, about_services: JSON.stringify(current) });
                      }}
                      className="w-1/2 px-4 py-2 border border-gray-200"
                    />
                    <input
                      placeholder="설명 (예: Main)"
                      value={service.desc}
                      onChange={(e) => {
                        const current = JSON.parse(siteContent.about_services || "[]");
                        current[idx].desc = e.target.value;
                        setSiteContent({ ...siteContent, about_services: JSON.stringify(current) });
                      }}
                      className="flex-grow px-4 py-2 border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = JSON.parse(siteContent.about_services || "[]");
                        const filtered = current.filter((_: any, i: number) => i !== idx);
                        setSiteContent({ ...siteContent, about_services: JSON.stringify(filtered) });
                      }}
                      className="p-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">경력 섹션 제목</label>
                <input
                  value={siteContent.about_experience_label}
                  onChange={(e) => setSiteContent({ ...siteContent, about_experience_label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">경력 리스트</label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = JSON.parse(siteContent.about_experience || "[]");
                      setSiteContent({ ...siteContent, about_experience: JSON.stringify([...current, { year: "", title: "", role: "" }]) });
                    }}
                    className="text-xs font-bold text-blue-500"
                  >
                    + 추가
                  </button>
                </div>
                {JSON.parse(siteContent.about_experience || "[]").map((exp: any, idx: number) => (
                  <div key={idx} className="space-y-2 p-4 border border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                      <input
                        placeholder="연도"
                        value={exp.year}
                        onChange={(e) => {
                          const current = JSON.parse(siteContent.about_experience || "[]");
                          current[idx].year = e.target.value;
                          setSiteContent({ ...siteContent, about_experience: JSON.stringify(current) });
                        }}
                        className="w-20 px-4 py-2 border border-gray-200"
                      />
                      <input
                        placeholder="작품명/활동명"
                        value={exp.title}
                        onChange={(e) => {
                          const current = JSON.parse(siteContent.about_experience || "[]");
                          current[idx].title = e.target.value;
                          setSiteContent({ ...siteContent, about_experience: JSON.stringify(current) });
                        }}
                        className="flex-grow px-4 py-2 border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = JSON.parse(siteContent.about_experience || "[]");
                          const filtered = current.filter((_: any, i: number) => i !== idx);
                          setSiteContent({ ...siteContent, about_experience: JSON.stringify(filtered) });
                        }}
                        className="p-2 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      placeholder="역할/설명"
                      value={exp.role}
                      onChange={(e) => {
                        const current = JSON.parse(siteContent.about_experience || "[]");
                        current[idx].role = e.target.value;
                        setSiteContent({ ...siteContent, about_experience: JSON.stringify(current) });
                      }}
                      className="w-full px-4 py-2 border border-gray-200"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">감독 사진 업로드</label>
                <div className="flex items-center gap-4">
                  {siteContent.about_image && (
                    <img src={siteContent.about_image} alt="Preview" className="w-20 h-20 object-cover border border-gray-200" referrerPolicy="no-referrer" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSiteContent({ ...siteContent, about_image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="flex-grow text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "PROJECT" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">페이지 제목</label>
                <input
                  value={siteContent.project_title}
                  onChange={(e) => setSiteContent({ ...siteContent, project_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">페이지 설명</label>
                <textarea
                  rows={3}
                  value={siteContent.project_desc}
                  onChange={(e) => setSiteContent({ ...siteContent, project_desc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-6">
                <h3 className="text-sm font-bold">상세 페이지 라벨 관리</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">역할 라벨 (예: 역할)</label>
                    <input
                      value={siteContent.project_role_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_role_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">장비 섹션 제목 (예: 사용 장비)</label>
                    <input
                      value={siteContent.project_equipment_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_equipment_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Camera 라벨</label>
                    <input
                      value={siteContent.project_camera_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_camera_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Lens 라벨</label>
                    <input
                      value={siteContent.project_lens_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_lens_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Lighting 라벨</label>
                    <input
                      value={siteContent.project_lighting_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_lighting_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Color 라벨</label>
                    <input
                      value={siteContent.project_color_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_color_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Back Button 라벨</label>
                    <input
                      value={siteContent.project_back_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_back_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">작품 개요 라벨</label>
                    <input
                      value={siteContent.project_desc_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_desc_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">촬영 의도 라벨</label>
                    <input
                      value={siteContent.project_intent_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_intent_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">기술적 접근 라벨</label>
                    <input
                      value={siteContent.project_tech_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_tech_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">촬영 환경 라벨</label>
                    <input
                      value={siteContent.project_env_label}
                      onChange={(e) => setSiteContent({ ...siteContent, project_env_label: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "EQUIPMENT" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">페이지 제목 (예: EQUIPMENT)</label>
                  <input
                    value={siteContent.equipment_page_title}
                    onChange={(e) => setSiteContent({ ...siteContent, equipment_page_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">페이지 소제목 (예: 보유 및 운용 장비)</label>
                  <input
                    value={siteContent.equipment_page_subtitle}
                    onChange={(e) => setSiteContent({ ...siteContent, equipment_page_subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">페이지 설명</label>
                <textarea
                  rows={3}
                  value={siteContent.equipment_desc}
                  onChange={(e) => setSiteContent({ ...siteContent, equipment_desc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">장비 카테고리 리스트</label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = JSON.parse(siteContent.equipment_list || "[]");
                      setSiteContent({ ...siteContent, equipment_list: JSON.stringify([...current, { category: "", items: [] }]) });
                    }}
                    className="text-xs font-bold text-blue-500"
                  >
                    + 카테고리 추가
                  </button>
                </div>
                {JSON.parse(siteContent.equipment_list || "[]").map((section: any, sIdx: number) => (
                  <div key={sIdx} className="p-6 border border-gray-100 bg-gray-50 space-y-6">
                    <div className="flex gap-4 items-end">
                      <div className="flex-grow space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">카테고리명</label>
                        <input
                          value={section.category}
                          onChange={(e) => {
                            const current = JSON.parse(siteContent.equipment_list || "[]");
                            current[sIdx].category = e.target.value;
                            setSiteContent({ ...siteContent, equipment_list: JSON.stringify(current) });
                          }}
                          className="w-full px-4 py-2 border border-gray-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = JSON.parse(siteContent.equipment_list || "[]");
                          const filtered = current.filter((_: any, i: number) => i !== sIdx);
                          setSiteContent({ ...siteContent, equipment_list: JSON.stringify(filtered) });
                        }}
                        className="p-2 text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">장비 아이템</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = JSON.parse(siteContent.equipment_list || "[]");
                            current[sIdx].items.push({ name: "", desc: "" });
                            setSiteContent({ ...siteContent, equipment_list: JSON.stringify(current) });
                          }}
                          className="text-[10px] font-bold text-blue-500"
                        >
                          + 아이템 추가
                        </button>
                      </div>
                      {section.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="flex gap-2">
                          <input
                            placeholder="장비명"
                            value={item.name}
                            onChange={(e) => {
                              const current = JSON.parse(siteContent.equipment_list || "[]");
                              current[sIdx].items[iIdx].name = e.target.value;
                              setSiteContent({ ...siteContent, equipment_list: JSON.stringify(current) });
                            }}
                            className="w-1/3 px-4 py-2 border border-gray-200 bg-white"
                          />
                          <input
                            placeholder="설명"
                            value={item.desc}
                            onChange={(e) => {
                              const current = JSON.parse(siteContent.equipment_list || "[]");
                              current[sIdx].items[iIdx].desc = e.target.value;
                              setSiteContent({ ...siteContent, equipment_list: JSON.stringify(current) });
                            }}
                            className="flex-grow px-4 py-2 border border-gray-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const current = JSON.parse(siteContent.equipment_list || "[]");
                              current[sIdx].items = current[sIdx].items.filter((_: any, i: number) => i !== iIdx);
                              setSiteContent({ ...siteContent, equipment_list: JSON.stringify(current) });
                            }}
                            className="p-2 text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "CONTACT" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">페이지 설명</label>
                <input
                  value={siteContent.contact_intro}
                  onChange={(e) => setSiteContent({ ...siteContent, contact_intro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                  <input
                    value={siteContent.contact_email}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                  <input
                    value={siteContent.contact_phone}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Instagram ID</label>
                  <input
                    value={siteContent.contact_instagram}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_instagram: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Instagram URL</label>
                  <input
                    value={siteContent.contact_instagram_url}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_instagram_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`px-10 py-3 bg-black text-white text-sm font-bold flex items-center gap-2 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
              <Save size={18} className={isSaving ? 'animate-pulse' : ''} /> 
              {isSaving ? "저장 중..." : `${activeTab} 내용 저장`}
            </button>
          </div>
        </form>
      </section>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">프로젝트 목록</h2>
        <button
          onClick={() => setEditingProject({
            title: "", type: "", year: new Date().getFullYear().toString(),
            thumbnail: "", description: "", intent: "", technical: "",
            environment: "", role: "", video_urls: [], images: [],
            equipment: { camera: "", lens: "", lighting: "", color: "" },
            is_featured: false
          })}
          className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
          title="새 프로젝트 추가"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="p-6 border border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-lg">{project.title}</h3>
              <p className="text-xs text-gray-400">{project.type} · {project.year}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingProject(project)}
                className="p-2 text-gray-400 hover:text-black transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProject && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-8">프로젝트 {editingProject.id ? "수정" : "추가"}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">제목</label>
                  <input
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">유형 (예: 독립 단편영화)</label>
                  <input
                    required
                    value={editingProject.type}
                    onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">연도</label>
                  <input
                    required
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">역할</label>
                  <input
                    required
                    value={editingProject.role}
                    onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">썸네일 업로드</label>
                <div className="flex items-center gap-4">
                  {editingProject.thumbnail && (
                    <img src={editingProject.thumbnail} alt="Preview" className="w-20 h-20 object-cover border border-gray-200" referrerPolicy="no-referrer" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file);
                          setEditingProject({ ...editingProject, thumbnail: compressed });
                        } catch (err) {
                          console.error("Image compression failed:", err);
                          // Fallback to original if compression fails
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingProject({ ...editingProject, thumbnail: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                    className="flex-grow text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">작품 개요</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">촬영 의도</label>
                <textarea
                  rows={3}
                  value={editingProject.intent}
                  onChange={(e) => setEditingProject({ ...editingProject, intent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">기술적 접근</label>
                <textarea
                  rows={3}
                  value={editingProject.technical}
                  onChange={(e) => setEditingProject({ ...editingProject, technical: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">촬영 환경 / 세팅</label>
                <textarea
                  rows={3}
                  value={editingProject.environment}
                  onChange={(e) => setEditingProject({ ...editingProject, environment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase">비디오 링크 (유튜브)</label>
                  <button
                    type="button"
                    onClick={() => setEditingProject({
                      ...editingProject,
                      video_urls: [...(editingProject.video_urls || []), { label: "", url: "" }]
                    })}
                    className="text-xs font-bold text-blue-500"
                  >
                    + 추가
                  </button>
                </div>
                {editingProject.video_urls?.map((v, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      placeholder="라벨 (예: 본편)"
                      value={v.label}
                      onChange={(e) => {
                        const newVideos = [...editingProject.video_urls!];
                        newVideos[idx].label = e.target.value;
                        setEditingProject({ ...editingProject, video_urls: newVideos });
                      }}
                      className="w-1/3 px-4 py-2 border border-gray-200"
                    />
                    <input
                      placeholder="URL"
                      value={v.url}
                      onChange={(e) => {
                        const newVideos = [...editingProject.video_urls!];
                        newVideos[idx].url = e.target.value;
                        setEditingProject({ ...editingProject, video_urls: newVideos });
                      }}
                      className="flex-grow px-4 py-2 border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newVideos = editingProject.video_urls!.filter((_, i) => i !== idx);
                        setEditingProject({ ...editingProject, video_urls: newVideos });
                      }}
                      className="p-2 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Camera</label>
                  <input
                    value={editingProject.equipment?.camera}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      equipment: { ...editingProject.equipment!, camera: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Lens</label>
                  <input
                    value={editingProject.equipment?.lens}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      equipment: { ...editingProject.equipment!, lens: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Lighting</label>
                  <input
                    value={editingProject.equipment?.lighting}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      equipment: { ...editingProject.equipment!, lighting: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Color</label>
                  <input
                    value={editingProject.equipment?.color}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      equipment: { ...editingProject.equipment!, color: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={editingProject.is_featured}
                  onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                />
                <label htmlFor="is_featured" className="text-sm font-medium">메인 페이지 노출 (Featured)</label>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-grow py-4 bg-black text-white font-bold flex items-center justify-center gap-2 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                >
                  <Save size={18} className={isSaving ? 'animate-pulse' : ''} /> 
                  {isSaving ? "저장 중..." : "저장하기"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-8 py-4 border border-gray-200 font-bold"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
