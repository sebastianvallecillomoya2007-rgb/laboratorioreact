export default function ProductArt({ category, large = false }) {
  return <svg className={`product-art ${large ? 'large' : ''}`} viewBox="0 0 320 220" fill="none" aria-hidden="true">
    <g stroke="#757e8e" strokeWidth="2" strokeLinejoin="round">
      {category === 'Tarjetas gráficas' ? <>
        <path d="M36 67 265 49 290 78 282 158 55 181 31 153Z" fill="#20252c" />
        <path d="m36 67 22 29 232-18M58 96l-3 85" /><path d="m77 169 172-15" stroke="#c4f561" strokeWidth="5" />
        {[108, 211].map(x => <g key={x}><ellipse cx={x} cy="125" rx="40" ry="35" fill="#101317" />{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${x} 125 q -24 -25 0 -30 q 17 7 0 30`} fill="#434b56" transform={`rotate(${i * 45} ${x} 125)`} />)}<circle cx={x} cy="125" r="10" fill="#a7d755" /></g>)}
      </> : category === 'Procesadores' ? <>
        <path d="m88 42 142 10 15 137-145-8Z" fill="#3f5648" /><path d="m104 59 112 7 12 105-111-6Z" fill="#a8b0b5" />
        <path d="m118 70 83 5 10 83-84-4Z" fill="#777f87" /><text x="164" y="115" fill="#151a20" stroke="none" fontSize="20" textAnchor="middle" fontFamily="sans-serif" fontWeight="800">NEXUS</text><text x="165" y="138" fill="#202630" stroke="none" fontSize="12" textAnchor="middle">CORE / X</text>
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${100+i*13} 36v9 M${108+i*13} 183v9`} stroke="#baa778" strokeWidth="5" />)}
      </> : category === 'Memoria RAM' || category === 'Almacenamiento' ? <>
        <path d="m42 105 217-47 18 66-217 48Z" fill="#242b33" /><path d="m48 109 203-44" stroke="#c4f561" strokeWidth="6" />
        {[75, 123, 171, 219].map(x => <path key={x} d={`m${x} ${130-(x-75)*.21} 27-6-7-28-27 6Z`} fill="#12161b" />)}
        <path d="m70 168 190-42" stroke="#cfb77a" strokeWidth="8" /><text x="175" y="191" fill="#87918b" stroke="none" fontSize="12" textAnchor="middle">{category === 'Memoria RAM' ? 'DDR5 · DUAL CHANNEL' : 'NVMe · HIGH SPEED'}</text>
      </> : category === 'Monitores' ? <>
        <path d="M39 36h244v140H39Z" fill="#282e37" /><path d="M48 45h226v121H48Z" fill="#172922" /><path d="m49 164 105-116 120 118M70 165 202 45" stroke="#9ecb5b" strokeWidth="3" /><path d="M150 176v21h-44m64-21v21h43" strokeWidth="7" />
      </> : <>
        <path d="m33 87 219-18 38 80-223 27Z" fill="#242b33" />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 12 }, (_, c) => <rect key={`${r}-${c}`} x={47+c*17+r*5} y={94+r*16-c*1.3} width="12" height="10" rx="2" fill={r===3 ? '#9db85a' : '#485449'} stroke="none" />))}
      </>}
    </g>
  </svg>
}
