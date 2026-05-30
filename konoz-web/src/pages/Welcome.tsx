import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Phone, MapPin, Mail, MessageCircle, Camera, ChevronLeft, ChevronRight, Star, Award, Clock, Shield, Gem, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../components/theme/ThemeContext';
import './Welcome.css';

const GALLERY_IMAGES = Array.from({ length: 38 }, (_, i) => ({
  src: `/images/WhatsApp Image 2026-05-29 at 6.59.08 AM${i === 0 ? '' : ` (${i})`}.jpeg`,
}));

const GALLERY_IMAGES_2 = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/WhatsApp Image 2026-05-29 at 6.59.09 AM${i === 0 ? '' : ` (${i})`}.jpeg`,
}));

const ALL_IMAGES = [...GALLERY_IMAGES, ...GALLERY_IMAGES_2];

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (src: string, idx: number) => {
    setLightboxImg(src);
    setLightboxIdx(idx);
  };

  const navigateLightbox = (dir: number) => {
    const newIdx = (lightboxIdx + dir + ALL_IMAGES.length) % ALL_IMAGES.length;
    setLightboxIdx(newIdx);
    setLightboxImg(ALL_IMAGES[newIdx].src);
  };

  return (
    <div className="welcome-page">
      {/* Floating Theme Toggle */}
      <button className="welcome-theme-toggle" onClick={toggleTheme} aria-label="تبديل الثيم">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ─── Navbar ─── */}
      <nav className="w-nav">
        <div className="w-nav-brand">
          <img src="/images/logo.png" alt="كنوز الحجر" className="w-nav-logo" />
          <div>
            <h1 className="w-nav-title">كنوز الحجر</h1>
            <span className="w-nav-sub">STONE TREASURES EST.</span>
          </div>
        </div>
        <div className="w-nav-actions">
          <a href="tel:0552154400" className="w-nav-link"><Phone size={16} /> اتصل بنا</a>
          <button className="w-btn-login" onClick={() => navigate('/login')}>
            <LogIn size={16} /> دخول النظام
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <header className="w-hero">
        <div className="w-hero-bg" />
        <div className="w-hero-content">
          <div className="w-hero-badge">
            <Gem size={14} /> المتخصصون في الحجر الطبيعي منذ 2002
          </div>
          <h1 className="w-hero-h1">نصنع الفخامة<br />من قلب الطبيعة</h1>
          <p className="w-hero-p">
            متخصصون في توريد وتركيب جميع أنواع الحجر الطبيعي بأعلى معايير الجودة العالمية.
            <br />نحوّل رؤيتكم إلى واقع يدوم.
          </p>
          <div className="w-hero-btns">
            <a href="https://wa.me/966552154400" target="_blank" rel="noreferrer" className="w-btn-cta">
              <MessageCircle size={18} /> تواصل معنا الآن
            </a>
            <a href="#gallery" className="w-btn-ghost">اكتشف أعمالنا ↓</a>
          </div>
        </div>
      </header>

      {/* ─── Stats ─── */}
      <section className="w-stats">
        <div className="w-stat"><span className="w-stat-num">+2000</span><span className="w-stat-label">مشروع منجز</span></div>
        <div className="w-stat"><span className="w-stat-num">+20</span><span className="w-stat-label">عاماً من الخبرة</span></div>
        <div className="w-stat"><span className="w-stat-num">+50</span><span className="w-stat-label">نوع حجر طبيعي</span></div>
        <div className="w-stat"><span className="w-stat-num">100%</span><span className="w-stat-label">رضا العملاء</span></div>
      </section>

      {/* ─── Why Us ─── */}
      <section className="w-why">
        <h2 className="w-section-title">لماذا كنوز الحجر؟</h2>
        <p className="w-section-sub">نلتزم بأعلى معايير الجودة في كل مشروع نقوم بتنفيذه</p>
        <div className="w-why-grid">
          <div className="w-why-card">
            <div className="w-why-icon"><Award size={28} /></div>
            <h3>جودة لا تُضاهى</h3>
            <p>نختار أفضل أنواع الحجر الطبيعي من أجود المحاجر لضمان متانة وجمال يدوم لعقود.</p>
          </div>
          <div className="w-why-card">
            <div className="w-why-icon"><Clock size={28} /></div>
            <h3>التزام بالمواعيد</h3>
            <p>نحرص على تسليم المشاريع في الوقت المحدد مع الحفاظ على أعلى معايير التنفيذ.</p>
          </div>
          <div className="w-why-card">
            <div className="w-why-icon"><Shield size={28} /></div>
            <h3>ضمان شامل</h3>
            <p>نقدم ضماناً شاملاً على جميع أعمالنا لأن ثقة عملائنا هي أساس نجاحنا.</p>
          </div>
          <div className="w-why-card">
            <div className="w-why-icon"><Star size={28} /></div>
            <h3>أسعار منافسة</h3>
            <p>نوفر أفضل الأسعار في السوق مع الحفاظ على الجودة العالية في كل التفاصيل.</p>
          </div>
        </div>
      </section>

      {/* ─── Premium Slider Gallery ─── */}
      <section className="w-gallery" id="gallery">
        <div className="w-gallery-header">
          <div>
            <h2 className="w-section-title">أبرز أعمالنا</h2>
            <p className="w-section-sub">لمحة من مشاريعنا التي تعكس خبرتنا الممتدة منذ عام 2002</p>
          </div>
          <button className="w-btn-view-all" onClick={() => navigate('/gallery')}>
            عرض جميع أعمالنا <ChevronLeft size={18} />
          </button>
        </div>
        
        <div className="w-gallery-slider-container">
          <div className="w-gallery-slider">
            {ALL_IMAGES.slice(0, 10).map((img, idx) => (
              <div key={idx} className="w-gallery-slide" onClick={() => openLightbox(img.src, idx)}>
                <img src={img.src} alt={`مشروع ${idx + 1}`} loading="lazy" />
                <div className="w-slide-overlay">
                  <span>تكبير الصورة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="w-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="w-lb-close" onClick={() => setLightboxImg(null)}><X size={24} /></button>
          <button className="w-lb-nav w-lb-prev" onClick={e => { e.stopPropagation(); navigateLightbox(-1); }}><ChevronRight size={32} /></button>
          <img src={lightboxImg} alt="عرض" onClick={e => e.stopPropagation()} />
          <button className="w-lb-nav w-lb-next" onClick={e => { e.stopPropagation(); navigateLightbox(1); }}><ChevronLeft size={32} /></button>
          <div className="w-lb-counter">{lightboxIdx + 1} / {ALL_IMAGES.length}</div>
        </div>
      )}

      {/* ─── Contact ─── */}
      <section className="w-contact">
        <h2 className="w-section-title">تواصل معنا</h2>
        <p className="w-section-sub">نسعد بخدمتكم والإجابة على جميع استفساراتكم</p>
        <div className="w-contact-grid">
          <div className="w-contact-info">
            <div className="w-contact-item">
              <MapPin size={22} />
              <div><strong>العنوان</strong><p>جدة - حي الصفا - طريق الحرمين - قبل كبري التحلية</p></div>
            </div>
            <div className="w-contact-item">
              <Phone size={22} />
              <div><strong>الهاتف</strong><p dir="ltr">012 233 0403</p></div>
            </div>
            <div className="w-contact-item">
              <Phone size={22} />
              <div><strong>الجوال</strong><p dir="ltr">055 215 4400</p></div>
            </div>
            <div className="w-contact-item">
              <Mail size={22} />
              <div><strong>البريد الإلكتروني</strong><p dir="ltr">stonetreasures.est@gmail.com</p></div>
            </div>
          </div>
          <div className="w-social-grid">
            <a href="https://wa.me/966552154400" target="_blank" rel="noreferrer" className="w-social whatsapp">
              <MessageCircle size={28} /><span>واتساب</span>
            </a>
            <a href="tel:0552154400" className="w-social call">
              <Phone size={28} /><span>اتصال مباشر</span>
            </a>
            <a href="https://instagram.com/stone.treasures" target="_blank" rel="noreferrer" className="w-social insta">
              <Camera size={28} /><span>stone.treasures</span>
            </a>
            <a href="mailto:stonetreasures.est@gmail.com" className="w-social mail">
              <Mail size={28} /><span>البريد الإلكتروني</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-footer">
        <img src="/images/logo.png" alt="كنوز الحجر" className="w-footer-logo" />
        <p>مؤسسة كنوز الحجر — متخصصون ببيع جميع أنواع الحجر الطبيعي</p>
        <p className="w-footer-copy">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};
