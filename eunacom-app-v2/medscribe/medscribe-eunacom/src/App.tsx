import React, { useState, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UploadCloud, FileVideo, Loader2, CheckCircle2, AlertCircle, BookOpen, ChevronRight, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuizQuestion {
  questionText: string;
  options: QuizOption[];
}

interface AnalysisResult {
  topic: string;
  summary: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
}

function InteractiveQuiz({ quiz }: { quiz: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qIndex: number, optionId: string) => {
    if (selectedAnswers[qIndex]) return; // Prevent changing answer
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionId }));
  };

  return (
    <div className="mt-12 space-y-8">
      <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Quiz EUNACOM</h3>
      {quiz.map((q, qIndex) => {
        const selectedId = selectedAnswers[qIndex];
        const isAnswered = !!selectedId;

        return (
          <div key={qIndex} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="font-semibold text-lg text-slate-800 mb-4">{qIndex + 1}. {q.questionText}</p>
            <div className="space-y-3">
              {q.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                let btnClass = "w-full text-left p-4 rounded-lg border transition-all ";

                if (!isAnswered) {
                  btnClass += "bg-white border-slate-300 hover:border-sky-500 hover:bg-sky-50";
                } else {
                  if (opt.isCorrect) {
                    btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900";
                  } else if (isSelected && !opt.isCorrect) {
                    btnClass += "bg-red-50 border-red-500 text-red-900";
                  } else {
                    btnClass += "bg-white border-slate-200 opacity-50";
                  }
                }

                return (
                  <div key={opt.id} className="space-y-2">
                    <button
                      onClick={() => handleSelect(qIndex, opt.id)}
                      disabled={isAnswered}
                      className={btnClass}
                    >
                      <span className="font-bold mr-2">{opt.id})</span> {opt.text}
                    </button>

                    {isAnswered && (isSelected || opt.isCorrect) && (
                      <div className={cn(
                        "p-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2",
                        opt.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      )}>
                        <strong>{opt.isCorrect ? 'Correcto' : 'Incorrecto'}: </strong>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Read a File as a base64-encoded string (no data URI prefix).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip "data:video/mp4;base64," prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => stopTimer();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const isVideo = selectedFile.type.startsWith('video/') ||
                    selectedFile.name.match(/\.(mp4|webm|mov|avi|mkv)$/i);
    if (!isVideo) {
      setError('Por favor, sube un archivo de video (MP4, WebM, MOV, etc.).');
      return;
    }
    // Claude supports up to ~25MB for inline base64 video content
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('El archivo es demasiado grande. El tamaño máximo recomendado es 100MB.');
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setStatusText('');
  };

  const processVideo = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStatusText('Leyendo archivo de video...');
    startTimer();

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('API key no encontrada. Asegúrate de configurar ANTHROPIC_API_KEY en .env.local');
      }

      // 1. Convert file to base64
      setStatusText('Codificando video...');
      const base64Data = await fileToBase64(file);

      // Determine media type
      let mediaType = file.type || 'video/mp4';
      if (!mediaType.startsWith('video/')) {
        mediaType = 'video/mp4';
      }

      // 2. Send to Claude
      setStatusText('Analizando video con Claude...');
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `Eres un tutor médico experto y preparador para el examen EUNACOM de Chile.
He subido un archivo de video sobre medicina.
Por favor, analiza el contenido y proporciona lo siguiente en formato JSON estructurado:

1. "topic": El tema principal del video (ej: "Gastroenterología", "Cardiología", etc.)
2. "summary": Un resumen detallado de lo que se dice en el video.
3. "keyPoints": Un arreglo de strings con los puntos clínicos más importantes.
4. "quiz": Genera 3 a 5 preguntas de selección múltiple (estilo caso clínico EUNACOM) basadas estrictamente en el contenido del video.
   Cada pregunta debe tener:
   - "questionText": El texto de la pregunta (preferiblemente un caso clínico breve).
   - "options": Un arreglo de 5 alternativas. Cada alternativa debe tener:
     - "id": "A", "B", "C", "D", o "E"
     - "text": El texto de la alternativa
     - "isCorrect": booleano (true si es la correcta, false si no)
     - "explanation": Explicación detallada de por qué esta alternativa es correcta o incorrecta.

El idioma de salida DEBE ser Español.
Responde SOLAMENTE con el JSON, sin texto adicional ni markdown.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'video',
                source: {
                  type: 'base64',
                  media_type: mediaType as 'video/mp4' | 'video/webm',
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      setStatusText('Procesando respuesta...');

      // Extract text from response
      let responseText = '';
      for (const block of response.content) {
        if (block.type === 'text') {
          responseText += block.text;
        }
      }

      if (!responseText) {
        throw new Error('No se recibió respuesta del modelo.');
      }

      // Clean up response — remove markdown code fences if present
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      try {
        const parsedResult = JSON.parse(cleanedText) as AnalysisResult;
        setResult(parsedResult);
      } catch (e) {
        console.error('Raw response:', responseText);
        throw new Error('Error al procesar la respuesta del modelo (JSON inválido).');
      }

    } catch (err: any) {
      console.error('Error processing video:', err);
      setError(err.message || 'Ocurrió un error al procesar el video. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      setStatusText('');
      stopTimer();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MedScribe <span className="text-sky-600 font-medium">EUNACOM</span></h1>
          </div>
          <div className="text-xs text-slate-400 font-mono">Powered by Claude</div>
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
                Genera transcripciones, resúmenes de estudio y preguntas tipo EUNACOM a partir de tus videos.
              </p>
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out cursor-pointer",
                isDragging
                  ? "border-sky-500 bg-sky-50"
                  : file
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 bg-white hover:border-sky-400 hover:bg-slate-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
                disabled={isLoading}
              />

              <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                {file ? (
                  <>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                      <FileVideo className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Archivo listo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-100 p-4 rounded-full text-slate-500">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-700">
                        Arrastra y suelta tu video aquí
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        MP4, WebM, MOV — máx 100MB
                      </p>
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

            {/* Action Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  processVideo();
                }}
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
                      Tiempo transcurrido: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <span>Generar Guía de Estudio</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Resultados del Análisis: {result.topic}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `clase-${result.topic.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Guardar para EUNACOM
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Analizar otro video
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Resumen</h3>
                  <div className="prose prose-slate max-w-none text-slate-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result.summary}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Puntos Clave</h3>
                  <ul className="space-y-3">
                    {result.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <InteractiveQuiz quiz={result.quiz} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
