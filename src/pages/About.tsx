import { useState, useEffect } from "react";

export default function About() {
  const [content, setContent] = useState({
    about_page_title: "ABOUT",
    about_name: "구성민",
    about_intro_label: "감독 소개",
    about_intro: "빛과 그림자, 그리고 그 사이의 공간이 만들어내는 감정에 매료되어 촬영을 시작했습니다. 카메라 렌즈를 통해 세상을 바라보는 것은 단순히 기록하는 행위를 넘어, 이야기의 본질을 시각적 언어로 번역하는 과정이라 믿습니다.\n\n저는 인물과 카메라 사이의 거리감, 조명이 만들어내는 리듬, 그리고 프레임 안의 정적을 중요하게 생각합니다. 기술적인 완벽함보다 작품이 전달하고자 하는 감정의 온도를 정확하게 포착하는 것에 집중합니다.\n\n앞으로도 진정성 있는 시선으로 관객의 마음을 움직이는 이미지를 설계해 나가겠습니다.",
    about_services_label: "가능 업무 범위",
    about_experience_label: "경력",
    about_image: "https://picsum.photos/seed/director/600/800",
    about_services: [
      { title: "촬영 (Cinematography)", desc: "Main" },
      { title: "조명 설계 (Lighting Design)", desc: "Expert" },
      { title: "색보정 (Color Grading)", desc: "DaVinci Resolve" },
      { title: "프리프로덕션 콘셉트 설계", desc: "Visual Planning" }
    ] as { title: string, desc: string }[],
    about_experience: [] as { year: string, title: string, role: string }[]
  });

  useEffect(() => {
    const keys = [
      "about_page_title",
      "about_name",
      "about_intro_label",
      "about_intro",
      "about_services_label",
      "about_experience_label",
      "about_image",
      "about_services",
      "about_experience"
    ];
    keys.forEach(key => {
      fetch(`/api/settings/${key}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.value) {
            let value = data.value;
            if (key === "about_services" || key === "about_experience") {
              try {
                value = JSON.parse(value);
              } catch (e) {
                value = [];
              }
            }
            setContent(prev => ({ ...prev, [key]: value }));
          }
        });
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12 mb-20">
        <div className="w-full md:w-[32.5%] shrink-0">
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img
              src={content.about_image}
              alt={`Director ${content.about_name}`}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1">
          <header className="mb-12">
            <h1 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{content.about_page_title}</h1>
            <h2 className="text-4xl font-bold tracking-tight">{content.about_name}</h2>
          </header>

          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">{content.about_intro_label}</h3>
            <div className="space-y-6 text-lg leading-relaxed font-light whitespace-pre-wrap">
              {content.about_intro}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-16 md:gap-24">
        <section className="flex-1">
          <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">{content.about_services_label}</h3>
          <ul className="space-y-4">
            {content.about_services.map((service, idx) => (
              <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-base font-medium">{service.title}</span>
                <span className="text-xs text-gray-400">{service.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1">
          <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">{content.about_experience_label}</h3>
          <div className="space-y-8">
            {content.about_experience.map((exp, idx) => (
              <div key={idx} className="flex gap-6">
                <span className="text-xs font-bold text-gray-300 w-12 pt-1">{exp.year}</span>
                <div>
                  <h4 className="text-base font-bold mb-1">{exp.title}</h4>
                  <p className="text-sm text-gray-500">{exp.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
