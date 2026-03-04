import { Mail, Phone, Instagram, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function Contact() {
  const [content, setContent] = useState({
    contact_page_title: "CONTACT",
    contact_intro: "프로젝트 제안이나 협업 문의는 아래 연락처로 부탁드립니다.\n보통 24시간 이내에 답변을 드립니다.",
    contact_email: "j66422069@gmail.com",
    contact_phone: "010-1234-5678",
    contact_instagram: "@sungmin_cinematography",
    contact_instagram_url: "#",
    resume_url: "/resume.pdf"
  });

  useEffect(() => {
    const keys = [
      "contact_page_title",
      "contact_intro",
      "contact_email",
      "contact_phone",
      "contact_instagram",
      "contact_instagram_url",
      "resume_url"
    ];
    keys.forEach(key => {
      fetch(`/api/settings/${key}?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.value) {
            setContent(prev => ({ ...prev, [key]: data.value }));
          }
        });
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-20">
        <h1 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{content.contact_page_title}</h1>
        <h2 className="text-4xl font-bold tracking-tight">함께 고민하고 설계하겠습니다.</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <p className="text-xl leading-relaxed font-light text-gray-600 whitespace-pre-wrap">
            {content.contact_intro}
          </p>

          <div className="space-y-6">
            <a href={`mailto:${content.contact_email}`} className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-lg font-medium">{content.contact_email}</p>
              </div>
            </a>

            <a href={`tel:${content.contact_phone}`} className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-lg font-medium">{content.contact_phone}</p>
              </div>
            </a>

            <a 
              href={content.contact_instagram_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-6 group"
            >
              <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <Instagram size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Instagram</p>
                <p className="text-lg font-medium">{content.contact_instagram}</p>
              </div>
            </a>
          </div>

          <div className="pt-12">
            <a
              href={content.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-deep-gray text-white text-sm font-medium hover:bg-black transition-all"
            >
              <FileText size={18} /> 이력서 다운로드 (PDF)
            </a>
          </div>
        </div>

        <div className="aspect-square bg-gray-50 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-32 h-32 border-2 border-black mx-auto mb-8 flex items-center justify-center">
              <span className="text-4xl font-bold">KSM</span>
            </div>
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">Cinematographer Portfolio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
