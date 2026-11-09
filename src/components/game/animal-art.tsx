import type { Animal } from "@/lib/game/catalog";

export function AnimalArt({ animal, className = "" }: { animal: Animal; className?: string }) {
  return <svg className={className} viewBox="0 0 160 150" role="img" aria-label={animal} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="80" cy="132" rx="47" ry="8" fill="#59445f" opacity=".12"/>
    {animal === "cat" && <>
      <path d="M39 67 43 24Q44 16 51 23L72 43Q80 40 88 43L109 23Q116 16 117 25L121 68" fill="#f3a9b9" stroke="#59445f" strokeWidth="5" strokeLinejoin="round"/>
      <path d="M51 58 54 35 72 51M109 58 106 35 88 51" fill="#fff0e9"/>
      <ellipse cx="80" cy="86" rx="47" ry="43" fill="#fff0e9" stroke="#59445f" strokeWidth="5"/>
      <path d="M57 82q8-10 16 0M87 82q8-10 16 0" fill="none" stroke="#59445f" strokeWidth="5" strokeLinecap="round"/>
      <path d="m75 94 5 4 5-4" fill="#e98d9e" stroke="#59445f" strokeWidth="3"/>
      <path d="M80 98q-8 11-17 3m17-3q8 11 17 3M42 91 19 86m24 14-24 4m99-13 23-5m-23 15 24 5" fill="none" stroke="#59445f" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {animal === "rabbit" && <>
      <path d="M54 65Q30 5 48 12Q68 13 75 62M86 62Q95 8 115 12Q132 19 105 70" fill="#fff0e9" stroke="#59445f" strokeWidth="5"/>
      <path d="M49 47Q42 17 51 22L68 59M98 58Q111 20 116 24Q120 32 104 61" fill="#eea3b6"/>
      <ellipse cx="80" cy="89" rx="43" ry="42" fill="#fff0e9" stroke="#59445f" strokeWidth="5"/>
      <ellipse cx="63" cy="83" rx="4" ry="6" fill="#59445f"/><ellipse cx="97" cy="83" rx="4" ry="6" fill="#59445f"/>
      <path d="m75 94 5 4 5-4q-5-7-10 0" fill="#e98d9e" stroke="#59445f" strokeWidth="2"/>
      <path d="M80 98q-8 11-17 3m17-3q8 11 17 3" fill="none" stroke="#59445f" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="48" cy="99" r="7" fill="#f3b7bf"/><circle cx="112" cy="99" r="7" fill="#f3b7bf"/>
    </>}
    {animal === "frog" && <>
      <circle cx="55" cy="54" r="23" fill="#b8dba7" stroke="#59445f" strokeWidth="5"/><circle cx="105" cy="54" r="23" fill="#b8dba7" stroke="#59445f" strokeWidth="5"/>
      <ellipse cx="80" cy="91" rx="53" ry="42" fill="#b8dba7" stroke="#59445f" strokeWidth="5"/>
      <circle cx="56" cy="53" r="8" fill="#fff"/><circle cx="104" cy="53" r="8" fill="#fff"/><circle cx="58" cy="54" r="4" fill="#59445f"/><circle cx="102" cy="54" r="4" fill="#59445f"/>
      <path d="M58 94q22 24 44 0" fill="none" stroke="#59445f" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="43" cy="91" r="8" fill="#ed9da7" opacity=".75"/><circle cx="117" cy="91" r="8" fill="#ed9da7" opacity=".75"/>
    </>}
    {animal === "fox" && <>
      <path d="M34 69 25 20Q24 12 33 17L69 44Q80 40 91 44L127 17Q136 12 135 21L126 71 119 108 80 130 41 108Z" fill="#e99b63" stroke="#59445f" strokeWidth="5" strokeLinejoin="round"/>
      <path d="m35 29 29 23-19 5zm90 0L96 52l19 5z" fill="#fff0e9"/>
      <path d="M42 82Q80 58 118 82L111 111Q80 139 49 111Z" fill="#fff0e9"/>
      <ellipse cx="62" cy="79" rx="5" ry="7" fill="#59445f"/><ellipse cx="98" cy="79" rx="5" ry="7" fill="#59445f"/>
      <path d="m73 96 7 5 7-5q-7-9-14 0" fill="#59445f"/><path d="M80 101q-7 9-15 2m15-2q7 9 15 2" fill="none" stroke="#59445f" strokeWidth="3" strokeLinecap="round"/>
    </>}
  </svg>;
}

export function RuleEmblem({ ruleId }: { ruleId: string }) {
  const symbol = ruleId === "R001" ? "●" : ruleId === "R002" ? "◆" : ruleId === "R003" ? "Ⅲ" : ruleId === "R004" ? "≠" : "✦";
  return <span className={`rule-emblem emblem-${ruleId.toLowerCase()}`} aria-hidden="true">{symbol}</span>;
}
