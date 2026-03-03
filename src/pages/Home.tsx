import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Project } from "../types";
import { motion } from "motion/react";

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [siteContent, setSiteContent] = useState({
    site_name: "구성민",
    site_role: "Cinematographer",
    site_intro: "감정과 공간을 설계하는 촬영감독입니다."
  });

  useEffect(() => {
    const t = Date.now();
    fetch(`/api/projects/featured?t=${t}`)
      .then((res) => res.json())
      .then((data) => setFeaturedProjects(data));

    fetch(`/api/settings/resume_url?t=${t}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setResumeUrl(data.value);
      });

    const homeKeys = ["site_name", "site_role", "site_intro"];
    homeKeys.forEach(key => {
      fetch(`/api/settings/${key}?t=${t}`)
        .then(res => res.json())
        .then(data => {
          if (data.value) {
            setSiteContent(prev => ({ ...prev, [key]: data.value }));
          }
        });
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <section className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold mb-4 tracking-tight">{siteContent.site_name}</h1>
          <p className="text-xl text-gray-500 mb-8 font-light">{siteContent.site_role}</p>
          <p className="text-2xl mb-12 max-w-2xl leading-relaxed">
            {siteContent.site_intro}
          </p>
          <div className="flex gap-4">
            <Link
              to="/project"
              className="px-8 py-4 bg-deep-gray text-white text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors"
            >
              프로젝트 보기 <ArrowRight size={16} />
            </Link>
            <a
              href={resumeUrl || "/resume.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-deep-gray text-deep-gray text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              이력서 다운로드 <Download size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">주요 작업</h2>
          <Link to="/project" className="text-xs font-medium border-b border-black pb-1">전체 보기</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.length > 0 ? (
            featuredProjects.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`} className="group">
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden mb-4">
                  <img
                    src={project.thumbnail || "https://picsum.photos/seed/cinema/800/450"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1">{project.title}</h3>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{project.role}</span>
                  <span>{project.year}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center border border-dashed border-gray-200 text-gray-400 text-sm">
              등록된 주요 작업이 없습니다. 관리자 페이지에서 프로젝트를 추가해주세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
