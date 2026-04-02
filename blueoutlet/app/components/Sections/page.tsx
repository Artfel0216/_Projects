import React, { useCallback } from 'react';
import { User, Mail, Phone, Briefcase, AlignLeft } from 'lucide-react';
import { InputField } from '../Atoms/page';

interface PersonalData {
  name: string;
  role: string;
  email: string;
  phone: string;
  bio: string;
}

interface PersonalSectionProps {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
  isEditing: boolean;
}

export const PersonalSection = ({ data, onChange, isEditing }: PersonalSectionProps) => {
  const handleChange = useCallback((field: keyof PersonalData, value: string) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <InputField 
        label="Nome Completo" 
        icon={User} 
        value={data.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Digite seu nome completo" 
        disabled={!isEditing}
        autoComplete="name"
      />
      
      <InputField 
        label="Cargo Profissional" 
        icon={Briefcase} 
        value={data.role || ''}
        onChange={(e) => handleChange('role', e.target.value)}
        placeholder="Ex: Senior Product Designer" 
        disabled={!isEditing}
        autoComplete="organization-title"
      />
      
      <InputField 
        label="E-mail" 
        icon={Mail} 
        type="email" 
        value={data.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="exemplo@dominio.com" 
        disabled={!isEditing}
        autoComplete="email"
      />
      
      <InputField 
        label="Telefone" 
        icon={Phone} 
        type="tel"
        value={data.phone || ''}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="(00) 00000-0000" 
        disabled={!isEditing}
        autoComplete="tel"
      />
      
      <div className="md:col-span-2 group">
        <InputField 
          label="Biografia" 
          icon={AlignLeft} 
          value={data.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Conte um pouco sobre sua trajetória profissional..." 
          disabled={!isEditing}
          className="min-h-30"
        />
      </div>
    </div>
  );
};