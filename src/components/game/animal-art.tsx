import { useId } from "react";
import type { Animal } from "@/lib/game/catalog";

export function AnimalArt({ animal, className = "" }: { animal: Animal; className?: string }) {
  const textureId = useId().replace(/:/g, "");
  return <svg className={className} viewBox="0 0 160 150" role="img" aria-label={animal} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${textureId}-ambient`} cx="50%" cy="45%" r="65%">
        <stop offset="0" stopColor="#fff8ed" stopOpacity=".95" />
        <stop offset="1" stopColor="#ead8d0" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${textureId}-cream`} x1="18%" y1="0%" x2="78%" y2="100%">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset=".58" stopColor="#f4e7d8" />
        <stop offset="1" stopColor="#ddc9bd" />
      </linearGradient>
      <linearGradient id={`${textureId}-pink`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffd5d7" />
        <stop offset=".58" stopColor="#efa7b6" />
        <stop offset="1" stopColor="#d987a0" />
      </linearGradient>
      <linearGradient id={`${textureId}-green`} x1="15%" y1="0%" x2="80%" y2="100%">
        <stop offset="0" stopColor="#d8edb9" />
        <stop offset=".55" stopColor="#a9cf91" />
        <stop offset="1" stopColor="#78a978" />
      </linearGradient>
      <linearGradient id={`${textureId}-orange`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0" stopColor="#ffc58d" />
        <stop offset=".58" stopColor="#e99360" />
        <stop offset="1" stopColor="#c96f4f" />
      </linearGradient>
      <radialGradient id={`${textureId}-shine`} cx="35%" cy="20%" r="75%">
        <stop offset="0" stopColor="#fff" stopOpacity=".78" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    
      <filter id={textureId} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="2" seed="8" result="grain" />
        <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
        <feComponentTransfer in="mono" result="soft-grain"><feFuncA type="table" tableValues="0 .10" /></feComponentTransfer>
        <feBlend in="SourceGraphic" in2="soft-grain" mode="soft-light" />
      </filter>
    </defs>
    <ellipse cx="80" cy="77" rx="72" ry="68" fill={`url(#${textureId}-ambient)`} />
    <g filter={`url(#${textureId})`}>
    <ellipse cx="80" cy="132" rx="47" ry="8" fill="#725966" opacity=".12"/>
    {animal === "cat" && <>
      <path d="M39 67 43 24Q44 16 51 23L72 43Q80 40 88 43L109 23Q116 16 117 25L121 68" fill={`url(#${textureId}-pink)`} stroke="#806875" strokeWidth="3.4" strokeLinejoin="round"/>
      <path d="M51 58 54 35 72 51M109 58 106 35 88 51" fill={`url(#${textureId}-cream)`}/>
      <ellipse cx="80" cy="86" rx="47" ry="43" fill={`url(#${textureId}-cream)`} stroke="#806875" strokeWidth="3.4"/>
      <path d="M57 82q8-10 16 0M87 82q8-10 16 0" fill="none" stroke="#806875" strokeWidth="3.4" strokeLinecap="round"/>
      <path d="m75 94 5 4 5-4" fill="#df879d" stroke="#806875" strokeWidth="2.4"/>
      <path d="M80 98q-8 11-17 3m17-3q8 11 17 3M42 91 19 86m24 14-24 4m99-13 23-5m-23 15 24 5" fill="none" stroke="#806875" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M72 55q-5 7-4 13m20-13q5 7 4 13" fill="none" stroke="#d5b4ae" strokeWidth="2" strokeLinecap="round" opacity=".72"/>
      <ellipse cx="48" cy="96" rx="8" ry="5" fill="#efb1b5" opacity=".42"/><ellipse cx="112" cy="96" rx="8" ry="5" fill="#efb1b5" opacity=".42"/>
      <path d="M57 70q8-5 15-1m16-1q7-4 15 1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".55"/>
    </>}
    {animal === "rabbit" && <>
      <path d="M54 65Q30 5 48 12Q68 13 75 62M86 62Q95 8 115 12Q132 19 105 70" fill={`url(#${textureId}-cream)`} stroke="#806875" strokeWidth="3.4"/>
      <path d="M49 47Q42 17 51 22L68 59M98 58Q111 20 116 24Q120 32 104 61" fill="#e99eaf"/>
      <ellipse cx="80" cy="89" rx="43" ry="42" fill={`url(#${textureId}-cream)`} stroke="#806875" strokeWidth="3.4"/>
      <ellipse cx="63" cy="83" rx="4" ry="6" fill="#725966"/><ellipse cx="97" cy="83" rx="4" ry="6" fill="#725966"/>
      <path d="m75 94 5 4 5-4q-5-7-10 0" fill="#df879d" stroke="#806875" strokeWidth="1.8"/>
      <path d="M80 98q-8 11-17 3m17-3q8 11 17 3" fill="none" stroke="#806875" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="48" cy="99" r="7" fill="#f3b7bf" opacity=".72"/><circle cx="112" cy="99" r="7" fill="#f3b7bf" opacity=".72"/>
      <path d="M62 111q18 8 36 0" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".55"/>
      <path d="M57 72q4-5 8-2m38-1q4-3 8 2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6"/>
      <path d="M43 31q3 15 9 22m62-22q-3 15-9 22" fill="none" stroke="#d99aaa" strokeWidth="2" strokeLinecap="round" opacity=".55"/>
    </>}
    {animal === "frog" && <>
      <circle cx="55" cy="54" r="23" fill={`url(#${textureId}-green)`} stroke="#806875" strokeWidth="3.4"/><circle cx="105" cy="54" r="23" fill={`url(#${textureId}-green)`} stroke="#806875" strokeWidth="3.4"/>
      <ellipse cx="80" cy="91" rx="53" ry="42" fill={`url(#${textureId}-green)`} stroke="#806875" strokeWidth="3.4"/>
      <circle cx="56" cy="53" r="8" fill="#fff"/><circle cx="104" cy="53" r="8" fill="#fff"/><circle cx="58" cy="54" r="4" fill="#725966"/><circle cx="102" cy="54" r="4" fill="#725966"/>
      <path d="M58 94q22 24 44 0" fill="none" stroke="#806875" strokeWidth="3.4" strokeLinecap="round"/>
      <circle cx="43" cy="91" r="8" fill="#ed9da7" opacity=".75"/><circle cx="117" cy="91" r="8" fill="#ed9da7" opacity=".75"/>
      <ellipse cx="80" cy="104" rx="27" ry="19" fill="#f4f1d8" opacity=".48"/>
      <path d="M48 57q3-9 9-11m55 11q-3-9-9-11" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".62"/>
      <circle cx="42" cy="71" r="2.3" fill="#e5f2c7" opacity=".8"/><circle cx="119" cy="72" r="2.3" fill="#e5f2c7" opacity=".8"/>
      <path d="M68 117q12 5 24 0" fill="none" stroke="#7ca67b" strokeWidth="2" strokeLinecap="round" opacity=".45"/>
    </>}
    {animal === "fox" && <>
      <path d="M34 69 25 20Q24 12 33 17L69 44Q80 40 91 44L127 17Q136 12 135 21L126 71 119 108 80 130 41 108Z" fill={`url(#${textureId}-orange)`} stroke="#806875" strokeWidth="3.4" strokeLinejoin="round"/>
      <path d="m35 29 29 23-19 5zm90 0L96 52l19 5z" fill={`url(#${textureId}-cream)`}/>
      <path d="M42 82Q80 58 118 82L111 111Q80 139 49 111Z" fill={`url(#${textureId}-cream)`}/>
      <ellipse cx="62" cy="79" rx="5" ry="7" fill="#725966"/><ellipse cx="98" cy="79" rx="5" ry="7" fill="#725966"/>
      <path d="m73 96 7 5 7-5q-7-9-14 0" fill="#725966"/><path d="M80 101q-7 9-15 2m15-2q7 9 15 2" fill="none" stroke="#806875" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M72 55q8 8 8 17m8-17q-8 8-8 17" fill="none" stroke="#f8c99f" strokeWidth="2.5" strokeLinecap="round" opacity=".8"/>
      <path d="M48 92q10-8 20-3m24 0q10-5 20 3" fill="none" stroke="#e6b8a4" strokeWidth="2" strokeLinecap="round" opacity=".75"/>
      <ellipse cx="51" cy="96" rx="8" ry="5" fill="#eaa2a0" opacity=".35"/><ellipse cx="109" cy="96" rx="8" ry="5" fill="#eaa2a0" opacity=".35"/>
    </>}
      <ellipse cx="65" cy="58" rx="26" ry="12" fill={`url(#${textureId}-shine)`} opacity=".34" />
    </g>
  </svg>;
}

export function CardBack({ className = "" }: { className?: string }) {
  const backId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 90 126" role="img" aria-label="ด้านหลังไพ่" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${backId}-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8d78b2" />
          <stop offset=".52" stopColor="#6d5a91" />
          <stop offset="1" stopColor="#51436f" />
        </linearGradient>
        <filter id={`${backId}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="12" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 .13" /></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <rect x="1" y="1" width="88" height="124" rx="10" fill="url(#{backId}-paper)" stroke="#fff" strokeWidth="2" />
      <g filter="url(#{backId}-grain)">
        <rect x="7" y="7" width="76" height="112" rx="7" fill="none" stroke="#e8dff3" strokeOpacity=".82" strokeWidth="1.3" />
        <rect x="12" y="12" width="66" height="102" rx="5" fill="none" stroke="#d7c7e8" strokeOpacity=".5" strokeDasharray="2 3" />
        <path d="M45 20 C72 37 72 89 45 106 C18 89 18 37 45 20Z" fill="#f4d9a7" fillOpacity=".16" stroke="#f3dfbd" strokeWidth="1.5" />
        <path d="M45 31 C63 44 63 82 45 95 C27 82 27 44 45 31Z" fill="none" stroke="#f3dfbd" strokeOpacity=".8" />
        <path d="M45 38 C55 48 55 77 45 88 C35 77 35 48 45 38Z" fill="#f4d9a7" fillOpacity=".24" />
        <path d="M45 43 L49 57 L63 63 L49 69 L45 83 L41 69 L27 63 L41 57Z" fill="#fff1d5" />
        <circle cx="45" cy="63" r="3" fill="#8b6a9d" />
        <circle cx="20" cy="22" r="1.5" fill="#f7e8ce" /><circle cx="70" cy="22" r="1.5" fill="#f7e8ce" />
        <circle cx="20" cy="104" r="1.5" fill="#f7e8ce" /><circle cx="70" cy="104" r="1.5" fill="#f7e8ce" />
      </g>
    </svg>
  );
}

export function RuleEmblem({ ruleId }: { ruleId: string }) {
  const symbol = ruleId === "R001" ? "●" : ruleId === "R002" ? "◆" : ruleId === "R003" ? "Ⅲ" : ruleId === "R004" ? "≠" : "✦";
  return <span className={`rule-emblem emblem-${ruleId.toLowerCase()}`} aria-hidden="true">{symbol}</span>;
}
