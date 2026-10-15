export function CookieArt({ kind, className = "" }: { kind: string; className?: string }) {
  const crumbs = <g fill="#d8b483" opacity=".55"><circle cx="45" cy="121" r="2"/><circle cx="161" cy="48" r="1.8"/><circle cx="183" cy="117" r="2.3"/><circle cx="64" cy="46" r="1.4"/><circle cx="137" cy="131" r="1.4"/></g>;
  return <svg aria-hidden="true" className={className} viewBox="0 0 230 165">
    <ellipse cx="115" cy="127" rx="70" ry="10" fill="#8b694b" opacity=".1"/>
    {kind === "rolls" ? <g strokeLinejoin="round">
      <g transform="translate(12 1) rotate(-22 100 80)"><path d="M57 47C29 55 23 106 60 122c18 8 33 1 32-7-1-6-12-6-21-15-17-16-11-30 1-40 10-9-3-17-15-13Z" fill="#b78549"/><path d="M57 43C29 51 23 102 60 118c18 8 33 1 32-7-1-6-12-6-21-15-17-16-11-30 1-40 10-9-3-17-15-13Z" fill="#e5c391" stroke="#c9a16c" strokeWidth="1.5"/><path d="M57 50C36 62 39 102 67 109" fill="none" stroke="#fff8e9" strokeWidth="7" strokeLinecap="round" opacity=".8"/></g>
      <g transform="translate(108 23) rotate(19 38 66)"><path d="M34 21C4 27-3 80 34 98c19 9 34 0 32-8-2-6-14-5-23-14-16-16-10-29 4-40 9-9-1-19-13-15Z" fill="#b78549"/><path d="M34 17C4 23-3 76 34 94c19 9 34 0 32-8-2-6-14-5-23-14-16-16-10-29 4-40 9-9-1-19-13-15Z" fill="#e6c698" stroke="#c9a16c" strokeWidth="1.5"/><path d="M33 25C14 36 12 66 36 81" fill="none" stroke="#fff8eb" strokeWidth="7" strokeLinecap="round" opacity=".85"/></g>
      <g fill="#fffaf0"><circle cx="58" cy="72" r="2"/><circle cx="78" cy="111" r="2"/><circle cx="149" cy="57" r="2"/><circle cx="145" cy="96" r="2"/><circle cx="62" cy="94" r="1"/></g>
    </g> : kind === "linzer" ? <g>
      <g transform="translate(23 25) rotate(-14 65 65)"><path d="M59 8c9-12 20-7 22 3 14-6 23 3 18 16 16 0 21 13 10 22 13 8 10 23-4 27 8 14-1 24-14 21 0 16-13 20-23 10-8 13-23 9-27-5-13 7-25-2-20-16-15 0-20-14-10-24-13-8-9-23 5-27-7-13 2-24 16-20 2-16 17-19 27-7Z" fill="#bb8449" transform="translate(0 5)"/><path d="M59 8c9-12 20-7 22 3 14-6 23 3 18 16 16 0 21 13 10 22 13 8 10 23-4 27 8 14-1 24-14 21 0 16-13 20-23 10-8 13-23 9-27-5-13 7-25-2-20-16-15 0-20-14-10-24-13-8-9-23 5-27-7-13 2-24 16-20 2-16 17-19 27-7Z" fill="#f0d4a9" stroke="#d3ab77" strokeWidth="2"/><path d="M60 79c-38-27-31-45-17-44 9 0 14 6 17 11 4-6 9-11 18-10 16 3 18 21-18 43Z" fill="#ad3e45"/><path d="M44 42c5-3 11-1 13 3" fill="none" stroke="#d37170" strokeWidth="3" strokeLinecap="round"/></g>
      <g transform="translate(139 64) rotate(14 30 30)"><circle cx="29" cy="31" r="34" fill="#bc8e58"/><circle cx="29" cy="27" r="34" fill="#f1d9b3" stroke="#d4b385" strokeWidth="2"/><path d="m29 8 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#ac3c43"/></g><g fill="#fffaf1" opacity=".85"><circle cx="58" cy="57" r="2"/><circle cx="76" cy="111" r="2"/><circle cx="163" cy="101" r="2"/><circle cx="109" cy="71" r="2"/></g>
    </g> : kind === "ginger" ? <g transform="translate(59 12) rotate(-12 54 74)">
      <path d="M54 10c19 0 25 24 12 34l32 7c17 4 14 26-2 24l-23-6 20 44c7 15-12 23-21 10L54 96l-18 27c-9 13-27 5-20-10l20-44-23 6C-3 77-6 55 11 51l32-7C29 34 36 10 54 10Z" fill="#945b2e" transform="translate(0 5)"/>
      <path d="M54 10c19 0 25 24 12 34l32 7c17 4 14 26-2 24l-23-6 20 44c7 15-12 23-21 10L54 96l-18 27c-9 13-27 5-20-10l20-44-23 6C-3 77-6 55 11 51l32-7C29 34 36 10 54 10Z" fill="#ba804b" stroke="#a56e3d" strokeWidth="2"/>
      <g fill="none" stroke="#fff1d9" strokeWidth="3" strokeLinecap="round"><path d="M46 34q8 9 16 0"/><path d="m12 61 10 2m64 0 10-2M29 112l6-8m38 0 6 8"/><path d="M44 50q10 8 20 0"/></g><g fill="#fff5e5"><circle cx="46" cy="27" r="2"/><circle cx="62" cy="27" r="2"/></g><circle cx="54" cy="65" r="4" fill="#9f4540"/><circle cx="54" cy="79" r="4" fill="#f3e5cf"/>
    </g> : kind === "nests" ? <g>
      <g transform="translate(42 23)"><ellipse cx="39" cy="101" rx="38" ry="10" fill="#c9955e"/><path d="M3 93 22 32q17-24 34 0l19 61q-35 19-72 0Z" fill="#866046" stroke="#714d36" strokeWidth="2"/><g fill="none" stroke="#b28a63" strokeWidth="3"><path d="M16 57q23 12 47 0M11 72q29 13 57 0M7 86q31 14 65 0M22 43q17 9 34 0"/></g><ellipse cx="39" cy="27" rx="10" ry="6" fill="#aa805a"/></g>
      <g transform="translate(126 59) scale(.7)"><ellipse cx="39" cy="101" rx="38" ry="10" fill="#c9955e"/><path d="M3 93 22 32q17-24 34 0l19 61q-35 19-72 0Z" fill="#896249" stroke="#714d36" strokeWidth="2"/><g fill="none" stroke="#b28a63" strokeWidth="3"><path d="M16 57q23 12 47 0M11 72q29 13 57 0M7 86q31 14 65 0M22 43q17 9 34 0"/></g></g>
    </g> : kind === "stars" ? <g fill="#dec092" stroke="#bc935c" strokeWidth="2"><path d="m93 27 15 32 36 5-26 25 6 36-31-17-32 17 6-36-26-25 36-5Z"/><path d="m164 67 9 19 22 3-16 15 4 22-19-10-19 10 4-22-16-15 22-3Z"/><path d="m93 38 12 26 28 4-20 19 5 28-25-13-25 13 5-28-20-19 28-4Z" fill="none" stroke="#fff5e4" strokeWidth="3"/></g> : <g fill="#f6e9cb" stroke="#d6bc88" strokeWidth="1.5"><path d="M42 108q12-87 44-60 24 24 24 63-32 17-68-3Z"/><path d="M115 110q17-64 41-44 21 16 23 45-31 15-64-1Z"/><g stroke="#fffaf0" strokeWidth="3"><path d="m64 80 3 3m14-22 4 3m-2 28 3 2m-31 3 3 3m77-12 4 3m14 9 4 2"/></g></g>}
    {crumbs}
  </svg>;
}

export function HolidayArt() {
  return <div className="holiday-art" aria-hidden="true">
    <svg viewBox="0 0 420 260" className="holiday-scene">
      <g fill="none" stroke="#4d6e50" strokeWidth="2" strokeLinecap="round"><path d="M268-8q-10 76 123 130M300 27l-3-29m5 32 28-15m-17 29 2-33m-3 34 35-7m-17 24 5-34m-5 35 38-3m-19 22 9-32m-10 33 38 4M271 4l-22 14m22-9 16 13"/><g strokeWidth="1.5"><path d="m302 28-15-13m36 38-13-27m16 30 20-24m-1 41-8-29m10 31 25-24m-9 40-4-25m6 25 25-19"/></g></g>
      <path d="M371 7v79" stroke="#b79d72" strokeWidth="1.5"/><rect x="363" y="83" width="16" height="8" rx="2" fill="#bc9a5e"/><circle cx="371" cy="114" r="25" fill="#a74643"/><path d="M359 96q-15 12-6 26" stroke="#d89785" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="197" cy="211" rx="136" ry="17" fill="#8c7051" opacity=".12"/><ellipse cx="197" cy="174" rx="139" ry="54" fill="#e8d8bd"/><ellipse cx="197" cy="167" rx="139" ry="54" fill="#faf5e8" stroke="#d5c3a5" strokeWidth="2"/><ellipse cx="197" cy="167" rx="118" ry="41" fill="none" stroke="#e4d5ba" strokeWidth="2"/>
      <g fill="#b5864e" stroke="#9b703f" strokeWidth="1.5"><path d="M105 146c-14-16-39 4-32 19 6 14 31 20 43 9 6-6-4-8-13-9-14-3-14-11-2-13 7-1 9-2 4-6Z"/><path d="M253 171c-19-12-40 16-26 28 10 9 34 8 42-5 4-7-7-6-14-4-14 2-17-5-7-12 6-4 11-2 5-7Z"/></g>
      <g fill="#f3dfb9" stroke="#cda36c" strokeWidth="2"><circle cx="146" cy="179" r="27"/><circle cx="251" cy="144" r="29"/></g><g fill="#ac4946"><path d="M145 194c-23-17-22-28-12-28 6 0 10 4 12 8 3-4 6-8 12-8 12 1 12 12-12 28Z"/><path d="m251 127 5 11 12 1-9 9 2 12-10-6-11 6 3-12-9-9 12-1Z"/></g>
      <g transform="translate(185 121) rotate(17)"><path d="m0-32 12 25 27 4-20 19 5 27L0 30l-24 13 5-27-20-19 27-4Z" fill="#c69154"/><path d="m0-24 10 23 22 3-16 15 4 22L0 27l-20 12 4-22-16-15 22-3Z" fill="none" stroke="#fff2d9" strokeWidth="2"/></g>
      <g fill="#c7a66a"><path d="m37 83 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m318 202 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><circle cx="54" cy="146" r="2"/><circle cx="318" cy="119" r="2"/></g>
    </svg>
    <span className="art-caption">upečeno s láskou</span>
  </div>;
}
