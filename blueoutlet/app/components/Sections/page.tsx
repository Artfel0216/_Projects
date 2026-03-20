import { User, Mail, Phone, CreditCard, Edit3 } from 'lucide-react';
import { InputField } from '../Atoms/page';

export const PersonalSection = ({ data, onChange, isEditing }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <InputField 
      label="Nome Completo" icon={User} value={data.name}
      onChange={(e) => onChange({...data, name: e.target.value})}
      placeholder="Seu nome" disabled={!isEditing}
    />
    <InputField 
      label="Cargo" icon={CreditCard} value={data.role}
      onChange={(e) => onChange({...data, role: e.target.value})}
      placeholder="Ex: Designer" disabled={!isEditing}
    />
    <InputField 
      label="E-mail" icon={Mail} type="email" value={data.email}
      onChange={(e) => onChange({...data, email: e.target.value})}
      placeholder="seu@email.com" disabled={!isEditing}
    />
    <InputField 
      label="Telefone" icon={Phone} value={data.phone}
      onChange={(e) => onChange({...data, phone: e.target.value})}
      placeholder="(00) 00000-0000" disabled={!isEditing}
    />
    <div className="md:col-span-2">
      <InputField 
        label="Bio" icon={Edit3} value={data.bio}
        onChange={(e) => onChange({...data, bio: e.target.value})}
        placeholder="Um pouco sobre você..." disabled={!isEditing}
      />
    </div>
  </div>
);