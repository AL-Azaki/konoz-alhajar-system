import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, ChevronLeft, LogIn, Phone, Moon, Sun } from 'lucide-react';
import { useTheme } from '../components/theme/ThemeContext';
import './Welcome.css';
import './Gallery.css';

// Using the same images from Welcome but with descriptions
const GALLERY_IMAGES = Array.from({ length: 38 }, (_, i) => ({
  src: `/images/WhatsApp Image 2026-05-29 at 6.59.08 AM${i === 0 ? '' : ` (${i})`}.jpeg`,
  title: `مشروع توريد وتركيب حجر طبيعي (${i + 1})`,
  desc: 'تنفيذ احترافي بأعلى معايير الجودة لواجهات الفلل والقصور.'
}));

const GALLERY_IMAGES_2 = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/WhatsApp Image 2026-05-29 at 6.59.09 AM${i === 0 ? '' : ` (${i})`}.jpeg`,
  title: `أعمال الديكور الداخلي والخارجي (${i + 1})`,
  desc: 'لمسات فنية من الحجر الطبيعي تضفي فخامة لا مثيل لها.'
}));

const ALL_WORKS = [...GALLERY_IMAGES, ...GALLERY_IMAGES_2];

export const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (src: string, idx: number) => {
    setLightboxImg(src);
    setLightboxIdx(idx);
  };

  const navigateLightbox = (dir: number) => {
    const newIdx = (lightboxIdx + dir + ALL_WORKS.length) % ALL_WORKS.length;
    setLightboxIdx(newIdx);
    setLightboxImg(ALL_WORKS[newIdx].src);
  };

  return (
    <div className="welcome-page gallery-page-bg">
      {/* Floating Theme Toggle */}
      <button className="welcome-theme-toggle" onClick={toggleTheme} aria-label="تبديل الثيم">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ─── Navbar (Same as Welcome) ─── */}
      <nav className="w-nav">
        <div className="w-nav-brand">
          <img src="/images/logo.png" alt="كنوز الحجر" className="w-nav-logo" />
          <div>
            <h1 className="w-nav-title">كنوز الحجر</h1>
            <span className="w-nav-sub">STONE TREASURES EST.</span>
          </div>
        </div>
        <div className="w-nav-actions">
          <button className="w-btn-back" onClick={() => navigate(-1)}>
            <ChevronRight size={18} /> عودة للرئيسية
          </button>
        </div>
      </nav>

      {/* ─── Page Header ─── */}
      <div className="g-header">
        <div className="g-header-bg"></div>
        <div className="g-header-content">
          <h1>السجل المعماري</h1>
          <p>نستعرض هنا تفاصيل مشاريعنا وإنجازاتنا التي نفخر بها منذ عام 2002</p>
        </div>
      </div>

      {/* ─── Full Gallery Grid ─── */}
      <section className="g-container">
        <div className="g-grid">
          {ALL_WORKS.map((work, idx) => (
            <div key={idx} className="g-card" onClick={() => openLightbox(work.src, idx)}>
              <div className="g-img-wrapper">
                <img src={work.src} alt={work.title} loading="lazy" />
                <div className="g-img-overlay">
                  <span>تكبير الصورة</span>
                </div>
              </div>
              <div className="g-card-content">
                <h3 className="g-card-title">{work.title}</h3>
                <p className="g-card-desc">{work.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="w-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="w-lb-close" onClick={() => setLightboxImg(null)}><X size={24} /></button>
          <button className="w-lb-nav w-lb-prev" onClick={e => { e.stopPropagation(); navigateLightbox(-1); }}><ChevronRight size={32} /></button>
          <div className="lb-content-wrapper" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg} alt="عرض" />
            <div className="lb-info">
              <h3>{ALL_WORKS[lightboxIdx].title}</h3>
              <p>{ALL_WORKS[lightboxIdx].desc}</p>
            </div>
          </div>
          <button className="w-lb-nav w-lb-next" onClick={e => { e.stopPropagation(); navigateLightbox(1); }}><ChevronLeft size={32} /></button>
          <div className="w-lb-counter">{lightboxIdx + 1} / {ALL_WORKS.length}</div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="w-footer">
        <img src="/images/logo.png" alt="كنوز الحجر" className="w-footer-logo" />
        <p>مؤسسة كنوز الحجر — متخصصون ببيع جميع أنواع الحجر الطبيعي</p>
        <p className="w-footer-copy">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};
