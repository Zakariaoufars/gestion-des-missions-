import React from 'react';

/**
 * Official Ministry Logo (Royaume du Maroc - Ministère de l'Agriculture)
 */
export const MinistryLogo: React.FC<{ className?: string; showSubtext?: boolean }> = ({
  className = 'w-16 h-16',
  showSubtext = true,
}) => (
  <div className="flex items-center gap-3">
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Seal Circle */}
      <circle cx="60" cy="60" r="56" stroke="#047857" strokeWidth="2.5" fill="#f0fdf4" />
      <circle cx="60" cy="60" r="51" stroke="#b45309" strokeWidth="1" strokeDasharray="3 2" />
      
      {/* Crown / Moroccan Heraldic Element */}
      <path d="M48 24 L60 16 L72 24 L68 28 L52 28 Z" fill="#b45309" />
      <circle cx="60" cy="20" r="2" fill="#dc2626" />
      
      {/* Moroccan Green Pentagram Star inside Golden Sun */}
      <circle cx="60" cy="50" r="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      <polygon
        points="60,37 63.5,46 73,46 65,52 68,61 60,55 52,61 55,52 47,46 56.5,46"
        fill="#047857"
        stroke="#065f46"
        strokeWidth="1"
      />

      {/* Wheat Stalks (Agriculture) */}
      <path d="M30 75 Q42 50 56 42" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M90 75 Q78 50 64 42" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      {/* Grains */}
      <ellipse cx="36" cy="65" rx="3" ry="5" transform="rotate(-30 36 65)" fill="#b45309" />
      <ellipse cx="44" cy="56" rx="3" ry="5" transform="rotate(-30 44 56)" fill="#b45309" />
      <ellipse cx="84" cy="65" rx="3" ry="5" transform="rotate(30 84 65)" fill="#b45309" />
      <ellipse cx="76" cy="56" rx="3" ry="5" transform="rotate(30 76 56)" fill="#b45309" />

      {/* Water & Furrows / Green Fields */}
      <path d="M22 88 C34 82 46 84 60 84 C74 84 86 82 98 88" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 96 C40 92 50 93 60 93 C70 93 80 92 92 96" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    {showSubtext && (
      <div className="leading-tight text-left">
        <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider font-serif">
          Royaume du Maroc
        </p>
        <p className="text-[10px] font-semibold text-emerald-800 leading-tight">
          Ministère de l'Agriculture
        </p>
        <p className="text-[8px] text-slate-500 uppercase tracking-tight">
          Pêche Maritime, Dév. Rural & Eaux et Forêts
        </p>
      </div>
    )}
  </div>
);

/**
 * Official ORMVAO Logo (Office Régional de Mise en Valeur Agricole de Ouarzazate)
 */
export const OrmvaoLogo: React.FC<{ className?: string; showSubtext?: boolean }> = ({
  className = 'w-16 h-16',
  showSubtext = true,
}) => (
  <div className="flex items-center gap-3">
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Hexagon / Shield */}
      <rect x="8" y="8" width="104" height="104" rx="20" fill="#065f46" />
      <rect x="12" y="12" width="96" height="96" rx="16" fill="#f0fdf4" stroke="#eab308" strokeWidth="2" />

      {/* Atlas Mountains Backdrop (Ouarzazate High Atlas) */}
      <polygon points="18,72 40,36 58,62 76,40 102,76 18,76" fill="#ca8a04" opacity="0.3" />
      <polygon points="35,74 54,42 70,68 85,46 102,74 35,74" fill="#047857" opacity="0.25" />

      {/* Kasbah / Ouarzazate Architectural Crenellations */}
      <rect x="36" y="60" width="48" height="22" fill="#b45309" rx="2" />
      <rect x="36" y="55" width="8" height="6" fill="#b45309" />
      <rect x="49" y="55" width="8" height="6" fill="#b45309" />
      <rect x="62" y="55" width="8" height="6" fill="#b45309" />
      <rect x="76" y="55" width="8" height="6" fill="#b45309" />
      {/* Kasbah windows */}
      <rect x="42" y="66" width="4" height="6" rx="1" fill="#fef3c7" />
      <rect x="58" y="66" width="4" height="6" rx="1" fill="#fef3c7" />
      <rect x="74" y="66" width="4" height="6" rx="1" fill="#fef3c7" />

      {/* Date Palm Tree (Phoenix dactylifera - Drâa Valley) */}
      <path d="M60 84 L60 52" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      {/* Palm fronds */}
      <path d="M60 52 Q44 42 32 48" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 52 Q50 36 44 26" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 52 Q60 30 60 22" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M60 52 Q70 36 76 26" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 52 Q76 42 88 48" stroke="#059669" strokeWidth="2" strokeLinecap="round" />

      {/* Irrigation Water Canal / Barrage Mansour Eddahbi waves */}
      <path d="M22 88 C38 82 48 94 62 88 C76 82 86 94 98 88" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 96 C42 90 52 102 62 96 C72 90 82 102 94 96" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />

      {/* Acronym Badge */}
      <rect x="30" y="98" width="60" height="14" rx="4" fill="#065f46" />
      <text x="60" y="108" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">
        ORMVAO
      </text>
    </svg>
    {showSubtext && (
      <div className="leading-tight text-left">
        <p className="text-[12px] font-extrabold text-emerald-950 tracking-wider">
          ORMVAO
        </p>
        <p className="text-[10px] font-semibold text-emerald-800 leading-tight">
          Ouarzazate
        </p>
        <p className="text-[8px] text-slate-500 uppercase tracking-tight">
          Mise en Valeur Agricole
        </p>
      </div>
    )}
  </div>
);

/**
 * Combined Official Letterhead Header for Printed Documents
 */
export const OfficialHeader: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`w-full border-b-2 border-emerald-900 pb-2 mb-3 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
    <div className="flex items-center justify-between">
      {/* Left: Ministry */}
      <div className="text-left w-2/5">
        <p className="font-serif font-bold text-slate-900 uppercase tracking-wide">
          Royaume du Maroc
        </p>
        <p className="font-semibold text-emerald-900 text-[9px] leading-tight mt-0.5">
          Ministère de l'Agriculture, de la Pêche Maritime, du Développement Rural et des Eaux et Forêts
        </p>
      </div>

      {/* Center: Dual Badges */}
      <div className="flex items-center gap-3 justify-center w-1/5">
        <MinistryLogo className="w-10 h-10" showSubtext={false} />
        <div className="h-8 w-[1px] bg-slate-300" />
        <OrmvaoLogo className="w-10 h-10" showSubtext={false} />
      </div>

      {/* Right: ORMVAO */}
      <div className="text-right w-2/5">
        <p className="font-bold text-emerald-900 uppercase tracking-wide">
          Office Régional de Mise en Valeur
        </p>
        <p className="font-bold text-emerald-950 uppercase tracking-wide">
          Agricole de Ouarzazate (ORMVAO)
        </p>
        <p className="text-[8px] text-slate-500 mt-0.5">
          Direction - Parc Automobile & Moyens Généraux
        </p>
      </div>
    </div>
  </div>
);
