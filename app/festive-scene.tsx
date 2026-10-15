export function ChristmasLights() {
  return <div className="christmas-lights" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} className={`bulb bulb-${i % 3}`} style={{ animationDelay: `${i * .3}s` }} />)}</div>;
}

export function ChristmasFriends() {
  return <div className="christmas-friends" role="img" aria-label="Animovaný Grinch v santovském kabátu mává. Vedle něj je sobík a pejsek Max.">
    <div className="hero-snow" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 11) % 100}%`, animationDelay: `${-i * .7}s`, animationDuration: `${6 + i % 5}s`, width: `${3 + i % 3}px`, height: `${3 + i % 3}px` }} />)}</div>
    <svg viewBox="0 0 520 330" className="friends-illustration" aria-hidden="true">
      <defs><linearGradient id="grinch-fur" x2=".7" y2="1"><stop stopColor="#bbe451"/><stop offset="1" stopColor="#84bb34"/></linearGradient><linearGradient id="santa-coat" x2=".7" y2="1"><stop stopColor="#e14747"/><stop offset="1" stopColor="#b72235"/></linearGradient><linearGradient id="deer-fur" x2=".8" y2="1"><stop stopColor="#b88a53"/><stop offset="1" stopColor="#8e633e"/></linearGradient></defs>
      <g transform="translate(405 117) scale(.78)"><TreeDrawing/></g>
      <g opacity=".17" fill="#b8d3b2"><path d="m29 225 36-64 37 64H88l29 47H12l29-47Z"/><path d="m424 181 33-61 34 61h-16l30 54h-96l30-54Z"/><path d="m112 125 18-37 20 37h-9l17 32h-54l17-32Z"/></g>
      <g fill="#ecc774"><path d="m409 53 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/><path d="m85 84 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/><circle cx="468" cy="118" r="2.5"/><circle cx="157" cy="63" r="2"/></g>
      <ellipse cx="266" cy="297" rx="229" ry="22" fill="#f4f5e9"/><ellipse cx="266" cy="302" rx="175" ry="9" fill="#dde9d7"/>
      <g transform="translate(49 138) scale(.72)"><g className="deer-bob">
        <ellipse cx="78" cy="215" rx="46" ry="7" fill="#c9d7bd"/>
        <path d="m54 182-2 27h14l8-27m26-1 9 28h13l-6-36" fill="#986b41"/><path d="M53 208h15v9H50v-4q0-5 3-5m57 0h14v9h-17v-5q0-4 3-4" fill="#4c3930"/>
        <ellipse cx="89" cy="170" rx="44" ry="33" fill="url(#deer-fur)"/>
        <path d="M50 171q-31-11-21-23 4-5 13 6" fill="#9a7147"/>
        <g className="deer-head"><g stroke="#dbc297" strokeWidth="6" fill="none" strokeLinecap="round"><path d="M63 54 48 22 45 2M51 29 34 25l-8-13M48 22 59 12M99 53l15-31 2-22m-5 28 17-8 6-14m-20 16-12-9"/></g>
          <path d="M55 60q-36-31-43-16-6 20 37 32m61-17q32-31 40-14 4 20-35 33" fill="#9e754a" stroke="#7e5a3a" strokeWidth="2"/><path d="M22 49q14 1 29 19M139 50q-17 2-24 17" stroke="#d5ab7a" strokeWidth="7" strokeLinecap="round"/>
          <path d="M44 84q0-48 38-48 41 0 41 48 0 55-42 55-38 0-37-55" fill="url(#deer-fur)"/><path d="M58 89q23-19 47 0l8 23q-28 31-57 0Z" fill="#dfbd8a"/>
          <g fill="#2e352d"><ellipse cx="63" cy="78" rx="4" ry="6"/><ellipse cx="102" cy="78" rx="4" ry="6"/></g><g fill="white"><circle cx="64" cy="76" r="1.5"/><circle cx="103" cy="76" r="1.5"/></g>
          <ellipse cx="83" cy="99" rx="16" ry="12" fill="#d94043" className="deer-nose"/><ellipse cx="78" cy="95" rx="5" ry="3" fill="#ffb5a2"/><path d="M76 116q8 8 16 0" fill="none" stroke="#82633f" strokeWidth="2.5" strokeLinecap="round"/>
        </g><path d="M48 130q35 16 70-1l-5 16q-35 14-62-1Z" fill="#c82f42"/><path d="m104 145 14 5-11 35-14-6Z" fill="#d33844"/><path d="m95 171 13 6" stroke="#edb46e" strokeWidth="4"/>
      </g></g>
      <g transform="translate(177 6)"><g className="grinch-bob">
        <ellipse cx="92" cy="285" rx="58" ry="8" fill="#bbccb4"/>
        <path d="m65 247-5 26 27 3 6-26m15-1 8 27 24-5-7-30" fill="#87bc36"/><path d="M59 269q-11 13-32 14-11 12 18 11l39-3 4-19m29 1 4 18 39 2q25-2 10-11-19-2-30-14" fill="#91c641" stroke="#77a632" strokeWidth="2"/>
        <path d="M64 138q-20 12-28 51l-12 31 27 11 9-24-10 44q45 25 99-2l-9-59q-9-47-39-53Z" fill="url(#santa-coat)"/>
        <path d="M51 192q41 16 90-1l3 16q-48 16-96-1Z" fill="#352f2b"/><rect x="87" y="192" width="24" height="19" rx="3" fill="#e9bc65"/><rect x="93" y="197" width="12" height="9" rx="1" fill="#534c32"/>
        <path d="M47 246q43 19 100-1l3 13q-56 25-104 1Z" fill="#fff2d9"/><path d="M22 216 46 226l-6 12-24-10Z" fill="#fff2d9"/>
        <path d="m18 226-12 7q-8 5 0 11l16 4-4-7 16 6q10 0 5-7l-15-12Z" fill="#a6d74a"/>
        <g className="grinch-wave"><path d="M126 145q29-1 36-24l10-28 25 12-12 40q-10 29-42 34Z" fill="url(#santa-coat)"/><path d="m169 95 30 11 5-13-32-12Z" fill="#fff2d9"/>
          <path d="M176 83q-6-13-3-25 3-10 8 0l2 12 2-23q3-10 7 0l-1 20 5-21q4-9 7 1l-5 23 8-16q7-6 7 4l-8 22q-2 17-13 17Z" fill="#a8d94c" stroke="#78a832" strokeWidth="1.5"/>
        </g>
        <path d="M61 132q32 24 64 0l8 13q-42 27-77 3Z" fill="#fff2d9"/>
        <g className="grinch-head"><path d="M50 67q-9-9-6-14l14 3q-4-16 10-32l7 12q14-20 31-20l-3 16q22-11 33 6l-9 3q25 19 21 50l-8 30q-18 30-51 20-45-10-51-46l-12-11 18-4-11-11Z" fill="url(#grinch-fur)" stroke="#7eae35" strokeWidth="2"/>
          <path d="M51 47q5-48 52-35 22 7 34 31l-26-3q-25-9-60 7Z" fill="#c72d3e"/><path d="M68 24q21-19 49-4l15 4q12 4 14 15l-8 17-14-8 3-13q-38-14-59-11Z" fill="#e14045"/><circle cx="139" cy="50" r="13" fill="#fff5dd"/><path d="M45 47q48-24 94-3l-1 14q-48-14-88 5Z" fill="#fff3dc"/>
          <g className="grinch-eyes"><path d="M60 79q15-5 26 3-9 21-23 10Z" fill="#f1d36d"/><path d="M97 82q18-7 30-2-1 18-20 14Z" fill="#f1d36d"/><ellipse cx="76" cy="86" rx="3" ry="7" fill="#243622"/><ellipse cx="107" cy="86" rx="3" ry="7" fill="#243622"/></g>
          <path d="m57 71 30 9m11 0 33-10" stroke="#33501f" strokeWidth="5" strokeLinecap="round"/><path d="M86 96q11-7 21 0l-8 8-9-3Z" fill="#6c9c2e"/>
          <path d="M55 102q39 41 76-3-20 32-47 27-18-3-29-24Z" fill="#497129"/><path d="M66 111q29 19 53-3-13 26-38 16Z" fill="#f7efcf"/><path d="M49 104q9-9 19 2m54-6q9-8 16-2" fill="none" stroke="#5b842a" strokeWidth="2" strokeLinecap="round"/><path d="m65 136-6 3m68-9 6 2" stroke="#92bb3e" strokeWidth="3"/>
        </g>
      </g></g>
      <g transform="translate(366 173)"><g className="max-bob"><ellipse cx="59" cy="124" rx="55" ry="7" fill="#becfb4"/>
        <g className="max-tail"><path d="M87 89q29-11 19-33-7-9-11 0 14 15-11 19Z" fill="#b5824d" stroke="#8b6039" strokeWidth="2"/></g>
        <ellipse cx="60" cy="93" rx="36" ry="25" fill="#b88852"/><path d="m36 100-5 20h19l4-19m25-1 1 21h18l-8-22" fill="#bc8d54"/><path d="M30 118h22v8H28m52-8h20v8H80" fill="#94673d"/>
        <g className="max-head"><path d="M28 20q-27 1-27 42 3 18 18 6l17-36m37-11q31-1 35 32 4 20-14 18L77 32" fill="#8d613c"/>
          <path d="M21 45q-1-39 37-39 33 0 30 38l-3 26q-29 27-61-1Z" fill="#c3945c"/><path d="M23 56q31-19 59 0l-1 16q-28 20-55-3Z" fill="#e4c292"/>
          <path d="M27 20q30-18 60 0" fill="none" stroke="#c73341" strokeWidth="6"/><path d="M55 14 54-9m0 7L44-13m10 5 12-10M55-5l-1-20" fill="none" stroke="#d8c69a" strokeWidth="5" strokeLinecap="round"/>
          <g className="max-eyes" fill="#332f27"><ellipse cx="40" cy="43" rx="4" ry="6"/><ellipse cx="69" cy="43" rx="4" ry="6"/></g><g fill="white"><circle cx="41" cy="41" r="1.3"/><circle cx="70" cy="41" r="1.3"/></g><path d="M45 57q11-9 22 0l-3 8H49Z" fill="#3d382e"/><path d="M45 70q13 12 25-2" fill="none" stroke="#87613d" strokeWidth="2.5" strokeLinecap="round"/><path d="M59 73q13-6 13 6-1 15-11 12Z" fill="#e78979"/><path d="M65 77v9" stroke="#bc655d" strokeWidth="1.5"/>
        </g><path d="M21 77q29 18 64-2l1 10q-28 24-67 8Z" fill="#be2b3d"/><path d="m35 92 13 2-3 18-13-4Z" fill="#d64147"/><circle cx="68" cy="90" r="6" fill="#eaca78"/>
      </g></g>
    </svg>
  </div>;
}

export function NorthPoleExpress() {
  return <section className="express-banner" aria-label="Polární expres">
    <div className="express-copy"><span className="express-ticket">JÍZDENKA DO VÁNOC · 1225</span><h2>Polární expres už vyráží.</h2><p>Příští zastávka: plná spíž a něco dobrého.</p></div>
    <div className="express-landscape polar-night" role="img" aria-label="Černá parní lokomotiva Polárního expresu číslo 1225 se třemi osobními vagony a zlatavými okny projíždí zasněženou nocí">
      <svg viewBox="0 0 680 150" preserveAspectRatio="none" className="express-track" aria-hidden="true">
        <circle cx="527" cy="23" r="12" fill="#e3edee" opacity=".75"/>
        <path d="m0 98 90-67 38 42 74-54 80 68 53-54 88 76 64-47 45 29 61-50 87 67v42H0Z" fill="#214466"/>
        <path d="m69 47 21-16 26 29-27-8-12 6Zm113-13 20-15 37 31-27-11-13 8Zm130 22 23-23 30 28-26-9-14 6Zm241-2 40-13 30 31-33-16-16 9Z" fill="#7a9bb7" opacity=".7"/>
        <path d="M0 119q73-25 150-4t145-5 165 5 220-8v43H0Z" fill="#bdcfe0"/>
        {[20,65,560,619,662].map((x,i)=><g key={x} transform={`translate(${x} ${i%2 ? 42 : 32})`} fill="#193852"><path d="m0 68 18-33h-7L27 8l17 27h-8l18 33Z"/><path d="m16 34 11-19 12 19m-22 16 10-16 11 16" fill="#d6e2e9"/><path d="M25 64h5v16h-5Z" fill="#537087"/></g>)}
      </svg>
      <div className="express-rails" aria-hidden="true"/>
      <div className="express-train"><svg viewBox="0 0 700 170" aria-hidden="true">
        <defs>
          <linearGradient id="polar-boiler" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#68717b"/><stop offset=".18" stopColor="#323840"/><stop offset=".55" stopColor="#131920"/><stop offset="1" stopColor="#070e15"/></linearGradient>
          <linearGradient id="polar-coach" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#554345"/><stop offset=".6" stopColor="#392c30"/><stop offset="1" stopColor="#20232b"/></linearGradient>
          <linearGradient id="polar-front" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#838d94"/><stop offset=".35" stopColor="#424c55"/><stop offset="1" stopColor="#18222c"/></linearGradient>
          <linearGradient id="polar-windows" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff0b9"/><stop offset="1" stopColor="#dea753"/></linearGradient>
          <linearGradient id="polar-beam"><stop stopColor="#ffe6a1" stopOpacity=".38"/><stop offset="1" stopColor="#ffe6a1" stopOpacity="0"/></linearGradient>
        </defs>
        <g transform="translate(40 0)"><g className="train-steam"><ellipse cx="520" cy="37" rx="25" ry="11" fill="#dce6ee" opacity=".87"/><ellipse cx="480" cy="26" rx="35" ry="15" fill="#c7d5e1" opacity=".65"/><ellipse cx="425" cy="19" rx="39" ry="14" fill="#b1c5d5" opacity=".4"/><ellipse cx="376" cy="10" rx="35" ry="12" fill="#dce6ed" opacity=".22"/></g></g>
        <g className="train-body">
          {[3,142,281].map((x,index)=><g key={x} transform={`translate(${x} 0)`}>
            <path d="M3 83q0-8 10-8h110q11 0 11 8v8H3Z" fill="#1b2530"/>
            <path d="M8 87h122v46H8Z" fill="url(#polar-coach)" stroke="#18202a" strokeWidth="1.5"/>
            <path d="M9 91h121M9 118h121" stroke="#bb9859" strokeWidth="1.4"/>
            {[15,30,45,60,75,90,105].map(wx=><g key={wx}><rect x={wx} y="95" width="10" height="17" rx="1" fill="url(#polar-windows)"/><path d={`M${wx+5} 95v17`} stroke="#846946" strokeWidth=".7"/></g>)}
            <path d="M14 130h111v8H14Z" fill="#101922"/>
            {[28,112].map(wx=><g key={wx} transform={`translate(${wx} 139)`}><circle r="8.5" fill="#101922" stroke="#687887" strokeWidth="1.2"/><circle r="4" fill="#697b86"/></g>)}
            <text x="68" y="126" textAnchor="middle" fill="#d8bb77" fontSize="5.5" fontFamily="Georgia" letterSpacing=".8">THE POLAR EXPRESS</text>
            {index===0 && <><path d="M2 89v38h6" stroke="#a3a6a2" strokeWidth="1.2" fill="none"/><circle cx="4" cy="100" r="2.5" fill="#bf4c4e"/></>}
          </g>)}
          <path d="M135 130h12m127 0h13m127 0h18" stroke="#a0a6a8" strokeWidth="2.5"/>
          <g transform="translate(40 0)">
          <path d="M391 70h59v65h-59Z" fill="#15222d" stroke="#0b141d" strokeWidth="2"/><path d="M387 66q30-12 67 0v7h-67Z" fill="#293746"/>
          <rect x="401" y="80" width="31" height="24" rx="2" fill="url(#polar-windows)" stroke="#69777c" strokeWidth="1.5"/><path d="M416 80v24" stroke="#4e5b60" strokeWidth="2"/>
          <path d="M441 102v28m-45-18h44" stroke="#71818e" strokeWidth="1.3"/><text x="417" y="122" textAnchor="middle" fontSize="10" fill="#d4c49a" fontFamily="Georgia">1225</text>
          <path d="M444 86q0-11 12-11h99q13 0 16 12v30q-1 13-13 13H443Z" fill="url(#polar-boiler)" stroke="#111d28" strokeWidth="1.5"/>
          <path d="M450 83h108" stroke="#8b9499" strokeWidth="1.8" opacity=".7"/>
          {[458,485,513,541].map(x=><path key={x} d={`M${x} 78v47`} stroke="#89929a" strokeWidth="2" opacity=".78"/>)}
          <path d="M449 94h101m-99 26h103" stroke="#a4a399" strokeWidth="1.4" opacity=".68"/>
          <path d="M473 61q1-10 13-10t14 10v15h-27Z" fill="#27323e" stroke="#111d27" strokeWidth="2"/>
          <path d="M518 55h19v22h-19Z" fill="#1a2632"/><path d="M517 53h23v6h-23Z" fill="#3f4b56"/><path d="m520 46-1-8h17l-1 8" fill="#151f2a"/><path d="M518 45h19v10h-19Z" fill="#202e3b"/>
          <path d="M468 53V43h4v10m-5-10h7" stroke="#a8996b" strokeWidth="1.5"/>
          <path d="M444 129h118v8H444Z" fill="#0c1620"/>
          <ellipse cx="565" cy="101" rx="15" ry="27" fill="url(#polar-front)" stroke="#a6adb0" strokeWidth="2"/>
          <ellipse cx="566" cy="101" rx="11" ry="23" fill="none" stroke="#7f8d98" strokeWidth="1"/>
          <path d="m564 82 4 38M556 101h20" stroke="#647987" strokeWidth="1.2"/>
          <ellipse cx="571" cy="99" rx="9" ry="11" fill="#131c24" stroke="#cfc2a4" strokeWidth="2"/><ellipse cx="572" cy="99" rx="6.5" ry="8" fill="#fff0b4"/>
          <path className="train-beam" d="m578 92 58-25v72l-58-31Z" fill="url(#polar-beam)"/>
          <rect x="556" y="117" width="19" height="6" rx="1" fill="#a39566"/><text x="565" y="122" fontSize="5" textAnchor="middle" fill="#17212a" fontFamily="Georgia">1225</text>
          <path d="M547 127h35l20 24h-58Z" fill="#243442" stroke="#a0adb6" strokeWidth="1.5"/>
          {[551,559,567,575,583].map(x=><path key={x} d={`M${x} 130 L${x+5} 149`} stroke="#899aaa" strokeWidth="2"/>)}
          <path d="M550 125v-11m0 2h29v11" stroke="#9aaab5" strokeWidth="1.4" fill="none"/>
          {[402,437,472,507].map(x=><g key={x} transform={`translate(${x} 134)`}><g className="train-wheel"><circle r="15" fill="#111b26" stroke="#899aa7" strokeWidth="2"/><circle r="11" fill="#253441"/><path d="M-11 0h22M0-11v22M-8-8L8 8M-8 8L8-8" stroke="#8b9eac" strokeWidth="1.7"/><circle r="3.5" fill="#c4c6bf"/></g></g>)}
          {[384,549,567].map(x=><g key={x} transform={`translate(${x} 141)`}><circle r="7" fill="#131f2a" stroke="#7f929f" strokeWidth="1.3"/><circle r="2.5" fill="#a9b6bf"/></g>)}
          <path className="train-rod" d="M402 137h106" stroke="#b9c2c4" strokeWidth="3.5" strokeLinecap="round"/><path d="m469 135 58-8h15" stroke="#a2b4bd" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M393 129h-8v18h10m41-39h-5v24" stroke="#718390" strokeWidth="1.5" fill="none"/>
          </g>
        </g>
      </svg></div>
    </div>
  </section>;
}

function TreeDrawing() {
  return <g>
    <ellipse cx="55" cy="186" rx="56" ry="9" fill="#e9f0e5"/>
    <path d="M48 153h15v32H48Z" fill="#8c5a3d"/>
    <path d="m55 13 29 50H72l31 49H87l28 50H-4l28-50H9l30-49H26Z" fill="#174f37" stroke="#427b52" strokeWidth="2"/>
    <path d="m55 13 17 29-16-5-13 5Zm-25 47 25-10 26 10 4 9-30-7-29 8Zm-13 47 38-10 40 12 6 10-46-9-44 9Zm-13 50 50-9 53 10 8 9H-4Z" fill="#f5f5e9"/>
    <path d="M37 75q18 15 40 2M22 122q35 19 70 1M18 145q35 14 74 0" stroke="#e7c46c" strokeWidth="2.5" fill="none"/>
    {[ [48,67],[67,91],[31,110],[77,131],[45,140],[95,153],[20,153] ].map(([x,y],i) => <g key={x}><circle cx={x} cy={y} r="5" fill={i%2 ? "#ebc769" : "#db4051"}/><circle cx={x-1.5} cy={y-1.5} r="1.5" fill="#fff4d1" opacity=".85"/></g>)}
    <path d="m55 0 4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1Z" fill="#f4d17a" stroke="#fff1b9" strokeWidth="1"/>
    <g><rect x="10" y="166" width="26" height="19" rx="2" fill="#b93445"/><path d="M23 166v19m-13-9h26" stroke="#e9cb81" strokeWidth="3"/><rect x="72" y="169" width="25" height="18" rx="2" fill="#d5ae5a"/><path d="M84 169v18m-12-9h25" stroke="#b92f41" strokeWidth="3"/></g>
  </g>;
}
export function SnowyChristmasTree() { return <svg className="snowy-tree" viewBox="-8 -4 129 201" role="img" aria-label="Zasněžený vánoční stromeček s červenými a zlatými ozdobami"><TreeDrawing/></svg>; }
