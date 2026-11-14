import { FormEvent, useState } from 'react';
import { Award, CheckCircle2, UserCheck, X } from 'lucide-react';
import { StudentRegistration } from '../types/app';

interface Props {
  initialRegistration: StudentRegistration | null;
  pendingCertificateTitle?: string;
  onSave: (reg: StudentRegistration) => void;
  onClose: () => void;
}

export function RegistrationModal({
  initialRegistration,
  pendingCertificateTitle,
  onSave,
  onClose,
}: Props) {
  const [fullName, setFullName] = useState(initialRegistration?.fullName ?? '');
  const [email, setEmail] = useState(initialRegistration?.email ?? '');
  const [location, setLocation] = useState(initialRegistration?.location ?? '');
  const [specialty, setSpecialty] = useState(initialRegistration?.specialty ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError('Укажи имя и фамилию для отображения в сертификате.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Укажи корректный email для привязки сертификата.');
      return;
    }

    onSave({
      fullName: trimmedName,
      email: trimmedEmail,
      location: location.trim(),
      specialty: specialty.trim(),
      registeredAt: initialRegistration?.registeredAt ?? new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070A12]/85 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Регистрация для получения сертификата"
    >
      <div className="w-full max-w-md bg-[#111827] border border-[#334155]/80 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/40 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[#4CD7F6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC]">
                {initialRegistration ? 'Данные для сертификата' : 'Быстрая регистрация'}
              </h2>
              <p className="text-[11px] text-[#94A3B8]">По желанию · нужна для именных дипломов</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть регистрацию"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {pendingCertificateTitle ? (
            <div className="rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/40 p-3 flex items-start gap-2.5 text-xs text-[#E9DDFF]">
              <Award className="w-4 h-4 text-[#D0BCFF] shrink-0 mt-0.5" />
              <div>
                Заполни данные — и сразу откроется именной сертификат по этапу{' '}
                <span className="font-bold">«{pendingCertificateTitle}»</span>.
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Обучение в NeuroCraft доступно свободно без регистрации. Укажи имя и email, чтобы
              получать именные сертификаты с оценкой и перечнем освоенных дисциплин.
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="reg-fullname">
              Имя и фамилия (как в сертификате) *
            </label>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="Например, Алексей Смирнов"
              className="w-full min-h-[44px] rounded-xl bg-[#0B0F19] border border-[#334155] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="reg-email">
              Email для привязки сертификата *
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="name@example.com"
              className="w-full min-h-[44px] rounded-xl bg-[#0B0F19] border border-[#334155] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="reg-location">
                Город или страна
              </label>
              <input
                id="reg-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Москва / Global"
                className="w-full min-h-[44px] rounded-xl bg-[#0B0F19] border border-[#334155] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]" htmlFor="reg-specialty">
                Специализация
              </label>
              <input
                id="reg-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="AI-инженер / Бизнес"
                className="w-full min-h-[44px] rounded-xl bg-[#0B0F19] border border-[#334155] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 p-3 text-xs text-[#FECACA]">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              className="btn-arcade-cyan flex-1 min-h-[48px] px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialRegistration ? 'Сохранить изменения' : 'Зарегистрироваться'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-arcade-surface min-h-[48px] px-4 rounded-xl text-xs font-semibold"
            >
              Позже
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
