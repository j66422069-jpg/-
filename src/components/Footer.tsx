import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function Footer() {
  const [links, setLinks] = useState({
    email: "j66422069@gmail.com",
    instagram_url: "#"
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings/contact_email")
      .then(res => res.json())
      .then(data => {
        if (data.value) setLinks(prev => ({ ...prev, email: data.value }));
      });
    fetch("/api/settings/contact_instagram_url")
      .then(res => res.json())
      .then(data => {
        if (data.value) setLinks(prev => ({ ...prev, instagram_url: data.value }));
      });
  }, []);

  return (
    <footer className="py-12 px-6 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-xs text-gray-400 tracking-widest">© 2026 GU SEONG MIN. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setIsEmailModalOpen(true)}
            className="text-xs text-gray-400 hover:text-black transition-colors cursor-pointer uppercase tracking-widest"
          >
            EMAIL
          </button>
          <a 
            href={links.instagram_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            INSTAGRAM
          </a>
        </div>
      </div>

      {isEmailModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div 
            className="bg-white p-8 max-w-sm w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contact Email</p>
              <p className="text-lg font-medium tracking-tight break-all">{links.email}</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
