// Banderas reales en SVG (3:2), sin emojis. Uso: <Flag code="CL" size={24} />
import React from 'react'

const FLAGS = {
  CL: "<rect width=\"30\" height=\"10\" fill=\"#fff\"/><rect y=\"10\" width=\"30\" height=\"10\" fill=\"#d52b1e\"/><rect width=\"10\" height=\"10\" fill=\"#0039a6\"/><polygon points=\"5.00,1.80 5.75,3.96 8.04,4.01 6.22,5.40 6.88,7.59 5.00,6.28 3.12,7.59 3.78,5.40 1.96,4.01 4.25,3.96\" fill=\"#fff\"/>",
  BO: "<rect width=\"30\" height=\"6.67\" fill=\"#d52b1e\"/><rect y=\"6.67\" width=\"30\" height=\"6.67\" fill=\"#f9e300\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#007934\"/>",
  EC: "<rect width=\"30\" height=\"10\" fill=\"#ffdd00\"/><rect y=\"10\" width=\"30\" height=\"5\" fill=\"#034ea2\"/><rect y=\"15\" width=\"30\" height=\"5\" fill=\"#ed1c24\"/><ellipse cx=\"15\" cy=\"10\" rx=\"2.2\" ry=\"2.8\" fill=\"#6b8f3a\" stroke=\"#ffdd00\" stroke-width=\".5\"/>",
  VE: "<rect width=\"30\" height=\"6.67\" fill=\"#ffcc00\"/><rect y=\"6.67\" width=\"30\" height=\"6.67\" fill=\"#00247d\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#cf142b\"/><circle cx=\"19.88473810680637\" cy=\"10.816931401231653\" r=\".55\" fill=\"#fff\"/><circle cx=\"18.98030796233643\" cy=\"9.253785941551074\" r=\".55\" fill=\"#fff\"/><circle cx=\"17.595794737286404\" cy=\"8.094242607299389\" r=\".55\" fill=\"#fff\"/><circle cx=\"15.898190880601314\" cy=\"7.478159203762319\" r=\".55\" fill=\"#fff\"/><circle cx=\"14.09225212898138\" cy=\"7.47984435757455\" r=\".55\" fill=\"#fff\"/><circle cx=\"12.395800984459271\" cy=\"8.099094814655977\" r=\".55\" fill=\"#fff\"/><circle cx=\"11.013454149868632\" cy=\"9.261219955612475\" r=\".55\" fill=\"#fff\"/><circle cx=\"10.11194277592947\" cy=\"10.826050571687027\" r=\".55\" fill=\"#fff\"/>",
  AR: "<rect width=\"30\" height=\"20\" fill=\"#74acdf\"/><rect y=\"6.67\" width=\"30\" height=\"6.67\" fill=\"#fff\"/><circle cx=\"15\" cy=\"10\" r=\"2.2\" fill=\"#f6b40e\"/>",
  CO: "<rect width=\"30\" height=\"10\" fill=\"#fcd116\"/><rect y=\"10\" width=\"30\" height=\"5\" fill=\"#003893\"/><rect y=\"15\" width=\"30\" height=\"5\" fill=\"#ce1126\"/>",
  PE: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"10\" height=\"20\" fill=\"#d91023\"/><rect x=\"20\" width=\"10\" height=\"20\" fill=\"#d91023\"/>",
  CU: "<rect y=\"0\" width=\"30\" height=\"4\" fill=\"#002a8f\"/><rect y=\"4\" width=\"30\" height=\"4\" fill=\"#fff\"/><rect y=\"8\" width=\"30\" height=\"4\" fill=\"#002a8f\"/><rect y=\"12\" width=\"30\" height=\"4\" fill=\"#fff\"/><rect y=\"16\" width=\"30\" height=\"4\" fill=\"#002a8f\"/><polygon points=\"0,0 13,10 0,20\" fill=\"#cf142b\"/><polygon points=\"4.60,7.40 5.21,9.16 7.07,9.20 5.59,10.32 6.13,12.10 4.60,11.04 3.07,12.10 3.61,10.32 2.13,9.20 3.99,9.16\" fill=\"#fff\"/>",
  MX: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"10\" height=\"20\" fill=\"#006847\"/><rect x=\"20\" width=\"10\" height=\"20\" fill=\"#ce1126\"/><circle cx=\"15\" cy=\"10\" r=\"2.3\" fill=\"#8c6b3e\"/>",
  ES: "<rect width=\"30\" height=\"20\" fill=\"#c60b1e\"/><rect y=\"5\" width=\"30\" height=\"10\" fill=\"#ffc400\"/>",
  PY: "<rect width=\"30\" height=\"6.67\" fill=\"#d52b1e\"/><rect y=\"6.67\" width=\"30\" height=\"6.67\" fill=\"#fff\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#0038a8\"/><circle cx=\"15\" cy=\"10\" r=\"1.6\" fill=\"none\" stroke=\"#0a7c2e\" stroke-width=\".5\"/>",
  UY: "<rect y=\"0.00\" width=\"30\" height=\"2.22\" fill=\"#fff\"/><rect y=\"2.22\" width=\"30\" height=\"2.22\" fill=\"#0038a8\"/><rect y=\"4.44\" width=\"30\" height=\"2.22\" fill=\"#fff\"/><rect y=\"6.67\" width=\"30\" height=\"2.22\" fill=\"#0038a8\"/><rect y=\"8.89\" width=\"30\" height=\"2.22\" fill=\"#fff\"/><rect y=\"11.11\" width=\"30\" height=\"2.22\" fill=\"#0038a8\"/><rect y=\"13.33\" width=\"30\" height=\"2.22\" fill=\"#fff\"/><rect y=\"15.56\" width=\"30\" height=\"2.22\" fill=\"#0038a8\"/><rect y=\"17.78\" width=\"30\" height=\"2.22\" fill=\"#fff\"/><rect width=\"11\" height=\"11.1\" fill=\"#fff\"/><circle cx=\"5.5\" cy=\"5.5\" r=\"2.6\" fill=\"#fcd116\"/>",
  DO: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"13\" height=\"8.5\" fill=\"#002d62\"/><rect x=\"17\" width=\"13\" height=\"8.5\" fill=\"#ce1126\"/><rect y=\"11.5\" width=\"13\" height=\"8.5\" fill=\"#ce1126\"/><rect x=\"17\" y=\"11.5\" width=\"13\" height=\"8.5\" fill=\"#002d62\"/>",
  PR: "<rect y=\"0\" width=\"30\" height=\"4\" fill=\"#ed0000\"/><rect y=\"4\" width=\"30\" height=\"4\" fill=\"#fff\"/><rect y=\"8\" width=\"30\" height=\"4\" fill=\"#ed0000\"/><rect y=\"12\" width=\"30\" height=\"4\" fill=\"#fff\"/><rect y=\"16\" width=\"30\" height=\"4\" fill=\"#ed0000\"/><polygon points=\"0,0 13,10 0,20\" fill=\"#0050f0\"/><polygon points=\"4.60,7.40 5.21,9.16 7.07,9.20 5.59,10.32 6.13,12.10 4.60,11.04 3.07,12.10 3.61,10.32 2.13,9.20 3.99,9.16\" fill=\"#fff\"/>",
  GT: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"10\" height=\"20\" fill=\"#4997d0\"/><rect x=\"20\" width=\"10\" height=\"20\" fill=\"#4997d0\"/><circle cx=\"15\" cy=\"10\" r=\"2\" fill=\"#6b8f3a\"/>",
  HN: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"30\" height=\"6.67\" fill=\"#0073cf\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#0073cf\"/><polygon points=\"15.00,9.10 15.21,9.71 15.86,9.72 15.34,10.11 15.53,10.73 15.00,10.36 14.47,10.73 14.66,10.11 14.14,9.72 14.79,9.71\" fill=\"#0073cf\"/><polygon points=\"11.50,7.70 11.71,8.31 12.36,8.32 11.84,8.71 12.03,9.33 11.50,8.96 10.97,9.33 11.16,8.71 10.64,8.32 11.29,8.31\" fill=\"#0073cf\"/><polygon points=\"18.50,7.70 18.71,8.31 19.36,8.32 18.84,8.71 19.03,9.33 18.50,8.96 17.97,9.33 18.16,8.71 17.64,8.32 18.29,8.31\" fill=\"#0073cf\"/><polygon points=\"11.50,10.50 11.71,11.11 12.36,11.12 11.84,11.51 12.03,12.13 11.50,11.76 10.97,12.13 11.16,11.51 10.64,11.12 11.29,11.11\" fill=\"#0073cf\"/><polygon points=\"18.50,10.50 18.71,11.11 19.36,11.12 18.84,11.51 19.03,12.13 18.50,11.76 17.97,12.13 18.16,11.51 17.64,11.12 18.29,11.11\" fill=\"#0073cf\"/>",
  SV: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"30\" height=\"6.67\" fill=\"#0047ab\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#0047ab\"/><circle cx=\"15\" cy=\"10\" r=\"2\" fill=\"none\" stroke=\"#c9a227\" stroke-width=\".6\"/>",
  NI: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect width=\"30\" height=\"6.67\" fill=\"#0067c6\"/><rect y=\"13.33\" width=\"30\" height=\"6.67\" fill=\"#0067c6\"/><polygon points=\"15,8 17,11.5 13,11.5\" fill=\"none\" stroke=\"#c9a227\" stroke-width=\".6\"/>",
  CR: "<rect width=\"30\" height=\"20\" fill=\"#002b7f\"/><rect y=\"3.33\" width=\"30\" height=\"13.33\" fill=\"#fff\"/><rect y=\"6.67\" width=\"30\" height=\"6.67\" fill=\"#ce1126\"/>",
  PA: "<rect width=\"30\" height=\"20\" fill=\"#fff\"/><rect x=\"15\" width=\"15\" height=\"10\" fill=\"#d21034\"/><rect y=\"10\" width=\"15\" height=\"10\" fill=\"#005293\"/><polygon points=\"7.50,2.80 8.02,4.29 9.59,4.32 8.34,5.27 8.79,6.78 7.50,5.88 6.21,6.78 6.66,5.27 5.41,4.32 6.98,4.29\" fill=\"#005293\"/><polygon points=\"22.50,12.80 23.02,14.29 24.59,14.32 23.34,15.27 23.79,16.78 22.50,15.88 21.21,16.78 21.66,15.27 20.41,14.32 21.98,14.29\" fill=\"#d21034\"/>",
}

export const FLAG_CODES = Object.keys(FLAGS)

export default function Flag({ code, size = 22, radius = 3, className = '' }) {
  const svg = FLAGS[String(code || '').toUpperCase()]
  const h = Math.round(size * 2 / 3)
  if (!svg) {
    return (
      <svg className={`flag ${className}`} width={size} height={h} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" rx="3" fill="#1e293b" />
        <circle cx="15" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M9 10h12M15 4c-2.5 3-2.5 9 0 12M15 4c2.5 3 2.5 9 0 12" fill="none" stroke="#94a3b8" strokeWidth="1" />
      </svg>
    )
  }
  const id = `fl-${code}-${size}`
  const rx = (radius * 30) / size
  return (
    <svg className={`flag ${className}`} width={size} height={h} viewBox="0 0 30 20" aria-hidden="true" style={{ borderRadius: radius, flex: 'none' }}>
      <clipPath id={id}><rect width="30" height="20" rx={rx} /></clipPath>
      <g clipPath={`url(#${id})`} dangerouslySetInnerHTML={{ __html: svg }} />
      <rect width="30" height="20" rx={rx} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".8" />
    </svg>
  )
}
