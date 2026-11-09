import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  History,
  Camera,
  CameraOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const OperatorBoardingPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<any>(null);

  const fetchRecentLogs = async () => {
    try {
      const res = await api.get('/boarding/recent-logs');
      setRecentLogs(res.data);
    } catch (err) {
      console.error('Erro ao buscar logs de embarque', err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Câmera não suportada neste navegador.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Inicia verificação por BarcodeDetector se suportado nativamente
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        });
        intervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedVal = barcodes[0].rawValue;
                if (detectedVal) {
                  stopCamera();
                  validateCode(detectedVal, 'QR_SCAN');
                }
              }
            } catch (e) {
              // ignora frame não decodificado
            }
          }
        }, 500);
      }
    } catch (err: any) {
      console.warn('Erro ao acessar câmera:', err);
      setCameraError('Acesso à câmera bloqueado ou não disponível.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const validateCode = async (code: string, method: 'QR_SCAN' | 'MANUAL_CODE' = 'MANUAL_CODE') => {
    try {
      setLoading(true);
      setValidationResult(null);

      const res = await api.post('/boarding/validate', {
        identifier: code.trim(),
        validator_name: 'Fiscal de Catraca 01',
        method: method,
      });

      setValidationResult(res.data);
      fetchRecentLogs();
      setManualCode('');
    } catch (err: any) {
      setValidationResult({
        result: 'DENIED',
        reason: err.response?.data?.detail || 'Erro na comunicação com a API.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    validateCode(manualCode, manualCode.includes(':') ? 'QR_SCAN' : 'MANUAL_CODE');
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6">
      {/* Cabeçalho Operacional */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <span className="text-[11px] font-black text-ttnb-teal uppercase tracking-wider block">
            CONTROLE DE EMBARQUE
          </span>
          <h1 className="text-2xl font-black text-ttnb-blue">
            Validação de Bilhetes
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Terminal Online • Catraca 01
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Scanner e Bipagem */}
        <div className="lg:col-span-7 space-y-4">
          {/* Seletor Câmera / Manual */}
          <div className="flex gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-ttnb-blue hover:bg-ttnb-dark text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Camera className="w-4 h-4 text-ttnb-teal" />
                <span>Ativar Scanner por Câmera</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <CameraOff className="w-4 h-4" />
                <span>Desativar Câmera</span>
              </button>
            )}
          </div>

          {/* Visualizador de Câmera */}
          {cameraActive && (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video border-2 border-ttnb-teal flex items-center justify-center shadow-md">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-bold text-white bg-black/70 px-3 py-1 rounded-md">
                  Aponte o QR Code aqui
                </span>
              </div>
            </div>
          )}

          {cameraError && (
            <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
              {cameraError}
            </p>
          )}

          {/* Campo de Busca Manual ou Leitor USB */}
          <form onSubmit={handleManualSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <label className="text-[12px] font-bold text-ttnb-blue block mb-1.5">
              Código do Bilhete ou Leitor Óptico
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ex: TTNB-A7F29C ou bipar QR Code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono uppercase focus:outline-none focus:border-ttnb-blue"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-ttnb-orange hover:bg-[#d96728] text-white px-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Atalhos Rápidos para Simulação de Bipagem */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-ttnb-teal" />
              <span>Atalhos Rápidos de Teste:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => validateCode('TTNB-A7F29C')}
                className="bg-white border border-slate-300 hover:border-ttnb-blue text-ttnb-blue text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                Bilhete Exemplo (TTNB-A7F29C)
              </button>
              <button
                type="button"
                onClick={() => validateCode('INVALID-CODE-999')}
                className="bg-white border border-slate-300 hover:border-red-400 text-red-600 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                Código Inexistente
              </button>
            </div>
          </div>

          {/* Card de Resultado da Validação */}
          {validationResult && (
            <div>
              {validationResult.result === 'ALLOWED' ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-emerald-950 shadow-sm animate-fade-in">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <h3 className="text-[17px] font-bold">EMBARQUE AUTORIZADO</h3>
                  </div>
                  <div className="mt-3 text-[13px] space-y-1">
                    <p>
                      <strong>Passageiro:</strong> {validationResult.passenger_name}
                    </p>
                    <p>
                      <strong>Documento:</strong> {validationResult.document_number}
                    </p>
                    <p>
                      <strong>Bilhete:</strong> {validationResult.ticket_code}
                    </p>
                    <p>
                      <strong>Destino:</strong> {validationResult.destination} ({validationResult.departure_time})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 text-rose-950 shadow-sm animate-fade-in">
                  <div className="flex items-center space-x-2 text-rose-700">
                    <XCircle className="w-6 h-6 shrink-0" />
                    <h3 className="text-[17px] font-bold">EMBARQUE RECUSADO</h3>
                  </div>
                  <p className="mt-2 text-[13px] text-rose-800 font-semibold">
                    {validationResult.reason}
                  </p>
                  {validationResult.first_boarded_at && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      Primeiro embarque registrado em:{' '}
                      {new Date(validationResult.first_boarded_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna Direita: Histórico Recente de Catraca */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <History className="w-4 h-4 text-ttnb-teal" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider">
                  Histórico Recente da Catraca
                </h2>
              </div>
              <button
                onClick={fetchRecentLogs}
                className="text-ttnb-teal hover:text-ttnb-blue text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {recentLogs.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">
                  Nenhum embarque registrado recentemente nesta catraca.
                </p>
              ) : (
                recentLogs.map((log, index) => (
                  <div
                    key={index}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-[13px]">
                        {log.passenger_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {log.ticket_code} · {log.method}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      {new Date(log.boarded_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
