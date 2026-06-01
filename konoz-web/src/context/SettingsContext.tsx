import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompanyInfo {
  name: string;
  vatNumber: string;
  address: string;
  phone: string;
}

export interface FactorySettings {
  workTypes: string[];
  productionTypes: string[];
  sizes: string[];
}

interface SettingsContextType {
  companyInfo: CompanyInfo;
  factorySettings: FactorySettings;
  updateCompanyInfo: (info: CompanyInfo) => void;
  updateFactorySettings: (settings: FactorySettings) => void;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'مؤسسة كنوز الحجر',
  vatNumber: '300000000000003',
  address: 'المملكة العربية السعودية',
  phone: '0552154400'
};

const DEFAULT_FACTORY_SETTINGS: FactorySettings = {
  workTypes: ['حجر منقبي', 'حجر بازلت', 'جرانيت', 'أخرى'],
  productionTypes: ['محكوم', 'عادي', 'ممشط', 'غير محدد'],
  sizes: ['5', '7', '10', '12', '15', '20', '25', '30', '40', 'مفتوح']
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem('konoz_company_info');
    try {
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_INFO;
    } catch {
      return DEFAULT_COMPANY_INFO;
    }
  });

  const [factorySettings, setFactorySettings] = useState<FactorySettings>(() => {
    const saved = localStorage.getItem('konoz_factory_settings');
    try {
      return saved ? JSON.parse(saved) : DEFAULT_FACTORY_SETTINGS;
    } catch {
      return DEFAULT_FACTORY_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('konoz_company_info', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    localStorage.setItem('konoz_factory_settings', JSON.stringify(factorySettings));
  }, [factorySettings]);

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  const updateFactorySettings = (settings: FactorySettings) => {
    setFactorySettings(settings);
  };

  return (
    <SettingsContext.Provider value={{ 
      companyInfo, 
      factorySettings, 
      updateCompanyInfo, 
      updateFactorySettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
