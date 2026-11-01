import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward, Clock, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react'
import '../styles/eunacomSitioTheme.css'

export default function VideoMasterclassPlayer({
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  posterUrl = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
  title = 'Masterclass EUNACOM: Estrategia de Alto Rendimiento & Guías GES',
  description = 'Clase magistral dictada por la Dirección Académica de Eunacom App. Análisis de casos clínicos de alta recurrencia, gestión del tiempo y errores que cuestan puntos.',
  durationIso = 'PT24M30S',
  uploadDate = '2026-08-01',
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)

  const chapters = [
    {
      time: 0,
      title: '1. Introducción al EUNACOM 2026-2027',
      pearl: 'El EUNACOM no evalúa memoria teórica pura, sino juicio clínico del médico general en la APS chilena.',
    },
    {
      time: 180,
      title: '2. Las 7 Áreas y Ponderación GES',
      pearl: 'El 70% del examen se concentra en Medicina Interna, Pediatría y Gineco-Obstetricia.',
    },
    {
      time: 450,
      title: '3. Casos Clínicos de Medicina Interna',
      pearl: 'En infarto con supradesnivel ST en CESFAM, el tiempo puerta-aguja para trombolisis es <30 min (GES).',
    },
    {
      time: 780,
      title: '4. Pediatría: PNI & Patología Respiratoria',
      pearl: 'El virus respiratorio sincicial (VRS) e inmunización con Nirsevimab son preguntas fijas en el examen actual.',
    },
    {
      time: 1100,
      title: '5. Plan de Estudio de 90 Días y Simulacros',
      pearl: 'Rendir al menos 4 simulacros completos de 180 preguntas aumenta la tasa de aprobación al 94.2%.',
    },
  ]

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    setCurrentTime(cur)

    // Determine active chapter
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (cur >= chapters[i].time) {
        setActiveChapterIndex(i)
        break
      }
    }
  }

  const seekToChapter = (timeSec) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = timeSec
    setCurrentTime(timeSec)
    if (!isPlaying) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Schema.org VideoObject Rich Snippet
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: description,
    thumbnailUrl: [posterUrl],
    uploadDate: uploadDate,
    duration: durationIso,
    contentUrl: videoUrl,
    embedUrl: 'https://www.eunacomapp.cl/blog',
    hasPart: chapters.map((ch, idx) => ({
      '@type': 'Clip',
      name: ch.title,
      startOffset: ch.time,
      endOffset: chapters[idx + 1] ? chapters[idx + 1].time : 1470,
      url: `https://www.eunacomapp.cl/blog#t=${ch.time}`,
    })),
    publisher: {
      '@type': 'Organization',
      name: 'Eunacom App',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.eunacomapp.cl/favicon.ico',
      },
    },
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8 text-white">
      {/* Inject Video Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      {/* Header Info */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Masterclass Médica en Video · Acceso Abierto
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-sky-400" />
          Duración: 24 min
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-black aspect-video flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
          playsInline
        />

        {/* Big Center Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute z-10 w-20 h-20 rounded-full bg-[var(--eunacom-blue)]/90 hover:bg-[var(--eunacom-blue)] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
            aria-label="Reproducir video"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-4 opacity-90 group-hover:opacity-100 transition">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-xs text-slate-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration || 1470)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRateChange}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-sky-300 transition"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Chapter Navigation & Clinical Takeaway */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900/90">
        {/* Chapters List */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-sky-400" />
            Capítulos & Marcadores de Tiempo
          </h4>
          <div className="space-y-2">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => seekToChapter(ch.time)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  activeChapterIndex === idx
                    ? 'bg-sky-950/70 border-sky-500/50 text-sky-200'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-900/40">
                    {formatTime(ch.time)}
                  </span>
                  <span className="text-sm font-semibold">{ch.title}</span>
                </div>
                {activeChapterIndex === idx && (
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    En curso
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Live Clinical Pearl Synchronized Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Perla Clínica Sincronizada
            </div>
            <div className="text-sm text-slate-200 leading-relaxed italic">
              "{chapters[activeChapterIndex].pearl}"
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
            Capítulo {activeChapterIndex + 1} de {chapters.length} · Sincronizado automáticamente
          </div>
        </div>
      </div>
    </div>
  )
}
