import { useState, useEffect } from "react";

export default function Equipment() {
  const [content, setContent] = useState({
    equipment_page_title: "EQUIPMENT",
    equipment_page_subtitle: "보유 및 운용 장비",
    equipment_desc: "작품의 톤과 매너에 가장 적합한 장비를 선택하여 최상의 결과물을 만들어냅니다. Sony Alpha 시스템 기반의 S-Log3 / S-Cinetone 운용에 능숙합니다.",
    equipment_list: [] as any[]
  });

  useEffect(() => {
    const t = Date.now();
    const keys = ["equipment_page_title", "equipment_page_subtitle", "equipment_desc", "equipment_list"];
    keys.forEach(key => {
      fetch(`/api/settings/${key}?t=${t}`)
        .then(res => res.json())
        .then(data => {
          if (data.value) {
            let value = data.value;
            if (key === "equipment_list") {
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
      <header className="mb-20">
        <h1 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{content.equipment_page_title}</h1>
        <h2 className="text-4xl font-bold tracking-tight">{content.equipment_page_subtitle}</h2>
        <p className="mt-6 text-lg text-gray-500 font-light max-w-2xl whitespace-pre-wrap">
          {content.equipment_desc}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
        {content.equipment_list.map((section) => (
          <section key={section.category}>
            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8 border-b border-gray-100 pb-4">
              {section.category}
            </h3>
            <div className="space-y-6">
              {section.items.map((item: any, idx: number) => (
                <div key={idx}>
                  <h4 className="text-base font-bold mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
