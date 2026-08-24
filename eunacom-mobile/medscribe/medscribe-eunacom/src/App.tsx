import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Loader2, CheckCircle2, AlertCircle, BookOpen, Copy, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TranscriptResult {
  id: string;
  originalFile: string;
  transcribedAt: string;
  transcript: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };
  React.useEffect(() => () => stopTimer(), []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const isVideo = selectedFile.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(selectedFile.name);
    if (!isVideo) { setError('Por favor, sube un archivo de video (MP4, WebM, MOV, etc.).'); return; }
    if (selectedFile.size > 500 * 1024 * 1024) { setError('El archivo es demasiado grande. Máximo 500MB.'); return; }
    setFile(selectedFile);
    setResult(null);
    setStatusText('');
  };

  const processVideo = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    startTimer();

    try {
      setStatusText('Subiendo video...');
      const formData = new FormData();
      formData.append('video', file);

      setStatusText('Transcribiendo con Whisper (esto puede tardar unos minutos)...');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data: TranscriptResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Ocurrió un error al transcribir el video.');
    } finally {
      setIsLoading(false);
      setStatusText('');
      stopTimer();
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.originalFile.replace(/\.[^.]+$/, '')}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-200">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              MedScribe <span className="text-sky-600 font-medium">EUNACOM</span>
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-mono">Whisper + Claude Code</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Sube tu clase médica
              </h2>
              <p className="text-slate-500 text-lg">
                Transcribe el audio de tu video con Whisper. Luego usa Claude Code para generar resumen, puntos clave y quiz EUNACOM.
              </p>
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer",
                isDragging ? "border-sky-500 bg-sky-50"
                  : file ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white hover:border-sky-400 hover:bg-slate-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="video/*" className="hidden" disabled={isLoading} />
              <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                {file ? (
                  <>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><FileVideo className="w-10 h-10" /></div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mt-2">
                      <CheckCircle2 className="w-4 h-4" /><span>Archivo listo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-100 p-4 rounded-full text-slate-500"><UploadCloud className="w-10 h-10" /></div>
                    <div>
                      <p className="text-lg font-medium text-slate-700">Arrastra y suelta tu video aquí</p>
                      <p className="text-sm text-slate-500 mt-1">MP4, WebM, MOV — máx 500MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => { e.stopPropagation(); processVideo(); }}
                disabled={!file || isLoading}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm",
                  !file || isLoading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md active:scale-[0.98]"
                )}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{statusText || 'Procesando...'}</span>
                    </div>
                    <span className="text-xs font-normal mt-1 opacity-80">
                      Tiempo: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <span>Transcribir Video</span>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-3">Cómo funciona</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li><strong>1.</strong> Sube un video de clase médica aquí</li>
                <li><strong>2.</strong> MedScribe transcribe el audio localmente con Whisper (gratis, sin API)</li>
                <li><strong>3.</strong> Copia la transcripción y pégala en Claude Code con el comando: <code className="bg-slate-100 px-2 py-0.5 rounded text-sky-700">/medscribe</code></li>
                <li><strong>4.</strong> Claude genera resumen, puntos clave y quiz EUNACOM</li>
                <li><strong>5.</strong> El resultado se guarda automáticamente en "Mis Clases"</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Transcript Result */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Transcripción Lista</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors">
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copiado!' : 'Copiar texto'}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Descargar .txt
                </button>
                <button onClick={() => { setResult(null); setFile(null); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Otro video
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{result.originalFile}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(result.transcribedAt).toLocaleString('es-CL')} — {result.transcript.length.toLocaleString()} caracteres
                  </p>
                </div>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                  {result.transcript}
                </pre>
              </div>
            </div>

            {/* Next step */}
            <div className="mt-6 bg-sky-50 border border-sky-200 rounded-xl p-5">
              <p className="font-semibold text-sky-900 mb-2">Siguiente paso</p>
              <p className="text-sm text-sky-800">
                Copia la transcripción de arriba, ve a Claude Code y escribe <code className="bg-sky-100 px-2 py-0.5 rounded font-mono">/medscribe</code>.
                Pega la transcripción y Claude generará el resumen, puntos clave y quiz EUNACOM. Se guardará automáticamente en "Mis Clases".
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
