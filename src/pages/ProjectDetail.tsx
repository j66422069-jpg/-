import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Project } from "../types";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [labels, setLabels] = useState({
    project_role_label: "역할",
    project_equipment_label: "사용 장비",
    project_camera_label: "Camera",
    project_lens_label: "Lens",
    project_lighting_label: "Lighting",
    project_color_label: "Color",
    project_back_label: "BACK TO LIST",
    project_desc_label: "작품 개요",
    project_intent_label: "촬영 의도",
    project_tech_label: "기술적 접근",
    project_env_label: "촬영 환경 / 세팅"
  });

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => setProject(data));

    const keys = Object.keys(labels);
    keys.forEach(key => {
      fetch(`/api/settings/${key}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.value) {
            setLabels(prev => ({ ...prev, [key]: data.value }));
          }
        });
    });
  }, [id]);

  if (!project) return <div className="max-w-7xl mx-auto px-6 py-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/project" className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black mb-12 transition-colors">
        <ArrowLeft size={14} /> {labels.project_back_label}
      </Link>

      <header className="mb-16">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">{project.title}</h1>
        <p className="text-lg text-gray-500 font-light">{project.type} · {project.year}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
        <div className="lg:col-span-2">
          {project.video_urls.length > 0 && (
            <div className="mb-12">
              <div className="flex gap-4 mb-6 border-b border-gray-100">
                {project.video_urls.map((video, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`pb-4 text-xs font-bold tracking-widest transition-colors ${
                      activeTab === idx ? "text-black border-b-2 border-black" : "text-gray-300 hover:text-gray-500"
                    }`}
                  >
                    {video.label.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="aspect-video-container">
                <iframe
                  src={project.video_urls[activeTab].url.replace("watch?v=", "embed/")}
                  title={project.video_urls[activeTab].label}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="space-y-12">
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_desc_label}</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_intent_label}</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{project.intent}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_tech_label}</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{project.technical}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_env_label}</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{project.environment}</p>
            </section>
          </div>
        </div>

        <aside className="space-y-12">
          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_role_label}</h3>
            <p className="text-base font-medium">{project.role}</p>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">{labels.project_equipment_label}</h3>
            <div className="space-y-4">
              {project.equipment.camera && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{labels.project_camera_label}</p>
                  <p className="text-sm">{project.equipment.camera}</p>
                </div>
              )}
              {project.equipment.lens && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{labels.project_lens_label}</p>
                  <p className="text-sm">{project.equipment.lens}</p>
                </div>
              )}
              {project.equipment.lighting && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{labels.project_lighting_label}</p>
                  <p className="text-sm">{project.equipment.lighting}</p>
                </div>
              )}
              {project.equipment.color && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{labels.project_color_label}</p>
                  <p className="text-sm">{project.equipment.color}</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
