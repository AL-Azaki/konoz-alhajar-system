import React, { useState } from 'react';
import { User, Lock, Save, Phone, Mail, MessageCircle, Settings as SettingsIcon, Building, Factory, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './Settings.css';

type TabType = 'profile' | 'factory' | 'company' | 'support';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { companyInfo, factorySettings, updateCompanyInfo, updateFactorySettings } = useSettings();
  
  const isExecutive = user?.roles?.includes('executive_manager') || user?.roles?.includes('factory_admin');
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Company State
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  // Factory Settings State
  const [localFactorySettings, setLocalFactorySettings] = useState(factorySettings);
  const [newItemInputs, setNewItemInputs] = useState({ workType: '', productionType: '', size: '' });
  const [isFactoryLoading, setIsFactoryLoading] = useState(false);

  const roleNameMap: Record<string, string> = {
    'executive_manager': 'المدير التنفيذي',
    'factory_admin': 'مدير المصنع',
    'data_entry': 'مدخل بيانات',
  };

  const roleName = user?.roles?.[0] ? roleNameMap[user.roles[0]] || user.roles[0] : 'غير محدد';

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const payload: any = {
        name: profileData.name,
        email: profileData.email,
      };

      if (profileData.new_password) {
        if (profileData.new_password !== profileData.new_password_confirmation) {
          toast.error('كلمة المرور الجديدة غير متطابقة.');
          setIsProfileLoading(false);
          return;
        }
        if (!profileData.current_password) {
          toast.error('يرجى إدخال كلمة المرور الحالية لتتمكن من تغييرها.');
          setIsProfileLoading(false);
          return;
        }
        payload.current_password = profileData.current_password;
        payload.new_password = profileData.new_password;
        payload.new_password_confirmation = profileData.new_password_confirmation;
      }

      await api.put('/profile', payload);
      toast.success('تم تحديث الملف الشخصي بنجاح.');
      
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      }));
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompanyLoading(true);
    
    setTimeout(() => {
      updateCompanyInfo(localCompanyInfo);
      toast.success('تم حفظ بيانات هوية الشركة بنجاح.');
      setIsCompanyLoading(false);
    }, 600);
  };

  const handleAddItem = (listName: keyof typeof newItemInputs) => {
    const val = newItemInputs[listName].trim();
    if (!val) return;
    
    // Map the input name to the factorySettings array name
    const arrMap: Record<string, keyof typeof localFactorySettings> = {
      workType: 'workTypes',
      productionType: 'productionTypes',
      size: 'sizes'
    };
    
    const targetArr = arrMap[listName];
    if (localFactorySettings[targetArr].includes(val)) {
      toast.error('هذا العنصر موجود مسبقاً');
      return;
    }

    setLocalFactorySettings(prev => ({
      ...prev,
      [targetArr]: [...prev[targetArr], val]
    }));
    
    setNewItemInputs(prev => ({ ...prev, [listName]: '' }));
  };

  const handleRemoveItem = (listName: keyof typeof localFactorySettings, item: string) => {
    setLocalFactorySettings(prev => ({
      ...prev,
      [listName]: prev[listName].filter(i => i !== item)
    }));
  };

  const handleSaveFactorySettings = () => {
    setIsFactoryLoading(true);
    setTimeout(() => {
      updateFactorySettings(localFactorySettings);
      toast.success('تم حفظ إعدادات المصنع بنجاح.');
      setIsFactoryLoading(false);
    }, 600);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="page-title">
          <SettingsIcon size={22} />
          الإعدادات النظام والملف الشخصي
        </h2>
        <p className="page-subtitle">إدارة معلومات الحساب، إعدادات المصنع، وهوية الشركة</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            الملف الشخصي
          </button>
          
          {isExecutive && (
            <>
              <button 
                className={`tab-btn ${activeTab === 'factory' ? 'active' : ''}`}
                onClick={() => setActiveTab('factory')}
              >
                <Factory size={18} />
                إعدادات المصنع
              </button>
              <button 
                className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                <Building size={18} />
                هوية الشركة للطباعة
              </button>
            </>
          )}

          <button 
            className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <MessageCircle size={18} />
            الدعم الفني
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card>
              <form onSubmit={handleProfileSubmit} className="form-stack">
                <div className="profile-card">
                  <div className="profile-avatar">
                    {user?.name ? user.name.charAt(0) : 'م'}
                  </div>
                  <div className="profile-info">
                    <h3>{user?.name}</h3>
                    <p className="role-badge">{roleName}</p>
                  </div>
                </div>

                <div className="settings-section-title">
                  <User size={16} />
                  المعلومات الشخصية
                </div>

                <div className="form-grid-2">
                  <Input 
                    label="الاسم"
                    type="text" 
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input 
                    label="البريد الإلكتروني"
                    type="email" 
                    name="email"
                    dir="ltr"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section-title">
                  <Lock size={16} />
                  تغيير كلمة المرور (اختياري)
                </div>
                
                <Input 
                  label="كلمة المرور الحالية"
                  type="password" 
                  name="current_password"
                  dir="ltr"
                  value={profileData.current_password}
                  onChange={handleProfileChange}
                  placeholder="أدخل كلمة المرور الحالية إذا أردت التغيير"
                />

                <div className="form-grid-2">
                  <Input 
                    label="كلمة المرور الجديدة"
                    type="password" 
                    name="new_password"
                    dir="ltr"
                    value={profileData.new_password}
                    onChange={handleProfileChange}
                    minLength={6}
                  />
                  <Input 
                    label="تأكيد كلمة المرور الجديدة"
                    type="password" 
                    name="new_password_confirmation"
                    dir="ltr"
                    value={profileData.new_password_confirmation}
                    onChange={handleProfileChange}
                    minLength={6}
                  />
                </div>

                <div className="form-actions">
                  <Button type="submit" isLoading={isProfileLoading} rightIcon={<Save size={18} />}>
                    حفظ التعديلات
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* FACTORY SETTINGS TAB */}
          {activeTab === 'factory' && isExecutive && (
            <Card>
              <div className="settings-section-title mb-4">
                <Factory size={16} />
                قوائم المصنع المعتمدة
              </div>
              <p className="text-muted mb-6 text-sm">هذه القوائم ستظهر في شاشات التقارير وإصدار إذن الصرف. يمكنك إضافة أنواع جديدة أو حذف القديمة.</p>

              <div className="lists-grid">
                {/* Work Types */}
                <div className="list-manager glass-panel">
                  <h4 className="list-title">أنواع الحجر الأساسية</h4>
                  <div className="add-item-bar">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="إضافة نوع حجر..." 
                      value={newItemInputs.workType}
                      onChange={e => setNewItemInputs({...newItemInputs, workType: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleAddItem('workType')}
                    />
                    <button className="btn btn-primary" onClick={() => handleAddItem('workType')}><Plus size={18}/></button>
                  </div>
                  <div className="items-list">
                    {localFactorySettings.workTypes.map(item => (
                      <div key={item} className="list-item">
                        <span>{item}</span>
                        <button className="btn-icon danger" onClick={() => handleRemoveItem('workTypes', item)}><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production Types */}
                <div className="list-manager glass-panel">
                  <h4 className="list-title">أنواع العمل</h4>
                  <div className="add-item-bar">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="إضافة نوع عمل..." 
                      value={newItemInputs.productionType}
                      onChange={e => setNewItemInputs({...newItemInputs, productionType: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleAddItem('productionType')}
                    />
                    <button className="btn btn-primary" onClick={() => handleAddItem('productionType')}><Plus size={18}/></button>
                  </div>
                  <div className="items-list">
                    {localFactorySettings.productionTypes.map(item => (
                      <div key={item} className="list-item">
                        <span>{item}</span>
                        <button className="btn-icon danger" onClick={() => handleRemoveItem('productionTypes', item)}><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="list-manager glass-panel">
                  <h4 className="list-title">المقاسات المعتمدة</h4>
                  <div className="add-item-bar">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="إضافة مقاس..." 
                      value={newItemInputs.size}
                      onChange={e => setNewItemInputs({...newItemInputs, size: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleAddItem('size')}
                    />
                    <button className="btn btn-primary" onClick={() => handleAddItem('size')}><Plus size={18}/></button>
                  </div>
                  <div className="items-list">
                    {localFactorySettings.sizes.map(item => (
                      <div key={item} className="list-item">
                        <span dir="ltr">{item}</span>
                        <button className="btn-icon danger" onClick={() => handleRemoveItem('sizes', item)}><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions mt-6">
                <Button onClick={handleSaveFactorySettings} isLoading={isFactoryLoading} rightIcon={<Save size={18} />}>
                  حفظ قوائم المصنع
                </Button>
              </div>
            </Card>
          )}

          {/* COMPANY INFO TAB */}
          {activeTab === 'company' && isExecutive && (
            <Card>
              <form onSubmit={handleCompanySubmit} className="form-stack">
                <div className="settings-section-title">
                  <Building size={16} />
                  هوية الشركة (للمطبوعات والفواتير)
                </div>

                <div className="form-grid-2">
                  <Input 
                    label="الاسم الرسمي للشركة / المؤسسة"
                    type="text" 
                    value={localCompanyInfo.name}
                    onChange={e => setLocalCompanyInfo({...localCompanyInfo, name: e.target.value})}
                    required
                  />
                  <Input 
                    label="الرقم الضريبي"
                    type="text" 
                    dir="ltr"
                    value={localCompanyInfo.vatNumber}
                    onChange={e => setLocalCompanyInfo({...localCompanyInfo, vatNumber: e.target.value})}
                  />
                  <div className="form-group full-width">
                    <Input 
                      label="العنوان الرسمي"
                      type="text" 
                      value={localCompanyInfo.address}
                      onChange={e => setLocalCompanyInfo({...localCompanyInfo, address: e.target.value})}
                    />
                  </div>
                  <Input 
                    label="رقم الهاتف الأساسي"
                    type="text" 
                    dir="ltr"
                    value={localCompanyInfo.phone}
                    onChange={e => setLocalCompanyInfo({...localCompanyInfo, phone: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <Button type="submit" isLoading={isCompanyLoading} rightIcon={<Save size={18} />}>
                    حفظ الهوية الرسمية
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <Card>
              <div className="settings-section-title">
                <MessageCircle size={16} />
                الدعم الفني والمساعدة
              </div>
              <p className="mb-6 text-muted">تواصل مع فريق الدعم الفني لحل أي مشكلة أو الاستفسار عن ميزات النظام.</p>
              
              <div className="support-items">
                <a href="tel:0552154400" className="support-item">
                  <div className="support-icon phone-icon"><Phone size={18} /></div>
                  <div>
                    <span className="support-label">الجوال</span>
                    <span className="support-value" dir="ltr">055 215 4400</span>
                  </div>
                </a>
                <a href="tel:0122330403" className="support-item">
                  <div className="support-icon phone-icon"><Phone size={18} /></div>
                  <div>
                    <span className="support-label">الهاتف</span>
                    <span className="support-value" dir="ltr">012 233 0403</span>
                  </div>
                </a>
                <a href="https://wa.me/966552154400" target="_blank" rel="noreferrer" className="support-item">
                  <div className="support-icon whatsapp-icon"><MessageCircle size={18} /></div>
                  <div>
                    <span className="support-label">واتساب</span>
                    <span className="support-value" dir="ltr">055 215 4400</span>
                  </div>
                </a>
                <a href="mailto:stonetreasures.est@gmail.com" className="support-item">
                  <div className="support-icon mail-icon"><Mail size={18} /></div>
                  <div>
                    <span className="support-label">البريد الإلكتروني</span>
                    <span className="support-value" dir="ltr">stonetreasures.est@gmail.com</span>
                  </div>
                </a>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};
