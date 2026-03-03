import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Project } from "../types";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLabel, setProjectLabel] = useState("PROJECTS");

  useEffect(() => {
    const t = Date.now();
    fetch(`/api/projects?t=${t}`)
      .then((res) => res.json())
      .then((data) => setProjects(data));

    fetch(`/api/settings/menu_project_label?t=${t}`)
      .then(res => res.json())
      .then(data => {
        if (data.value) setProjectLabel(data.value.toUpperCase());
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-20">
        <h1 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{projectLabel}</h1>
        <h2 className="text-4xl font-bold tracking-tight">작업 목록</h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-6 text-xs font-bold tracking-widest text-gray-400 uppercase w-40">Thumbnail</th>
              <th className="py-6 text-xs font-bold tracking-widest text-gray-400 uppercase">Project Name</th>
              <th className="py-6 text-xs font-bold tracking-widest text-gray-400 uppercase">Type</th>
              <th className="py-6 text-xs font-bold tracking-widest text-gray-400 uppercase text-right">Year</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-8">
                    <Link to={`/project/${project.id}`}>
                      <div className="w-32 aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={project.thumbnail || "https://picsum.photos/seed/cinema/200/112"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </Link>
                  </td>
                  <td className="py-8">
                    <Link to={`/project/${project.id}`} className="text-2xl font-bold hover:underline">
                      {project.title}
                    </Link>
                  </td>
                  <td className="py-8 text-lg text-gray-500">{project.type}</td>
                  <td className="py-8 text-lg text-gray-500 text-right">{project.year}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-400 text-sm">
                  등록된 프로젝트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
