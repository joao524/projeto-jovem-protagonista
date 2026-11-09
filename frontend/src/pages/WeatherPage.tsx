import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, Wind, Droplets, Thermometer, Info, ArrowRight, RefreshCw, Compass } from 'lucide-react';
import { api } from '../services/api';

export const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/public/weather');
      setWeather(res.data);
    } catch (err) {
      console.error('Erro ao buscar clima', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Título da Tela e Barra Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <CloudSun className="w-3.5 h-3.5 text-amber-600" />
              Condições Náuticas & Meteorologia
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ttnb-blue mt-1">
              O tempo na Baía de Todos os Santos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Boletim climático oficial para as rotas marítimas Salvador ⇄ Mar Grande e Salvador ⇄ Morro de SP.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadWeather(true)}
            disabled={refreshing || loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar tempo'}</span>
          </button>
        </div>

        {/* Card Principal do Clima Atual */}
        <div className="mt-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-bold border-b border-slate-100 pb-3">
            <span className="text-slate-800">{weather?.location || 'SALVADOR, BA • TERMINAL DA FRANÇA'}</span>
            <span className="text-slate-400 font-mono">{weather?.date_time || 'HOJE 14:00'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-5">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
                <CloudSun className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <span className="text-5xl font-black text-ttnb-blue leading-none tracking-tight">
                  {weather?.temperature_celsius || 28}°C
                </span>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  {weather?.condition || 'Parcialmente nublado com boa visibilidade'}
                </p>
              </div>
            </div>

            {/* Status da Navegação */}
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3.5 px-4 text-emerald-900 text-xs flex items-center gap-3">
              <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block uppercase tracking-wide">Travessia Aberta</span>
                <span className="text-emerald-700">Mar com ondas brandas e ventos favoráveis.</span>
              </div>
            </div>
          </div>

          {/* Métricas Marítimas (Vento, Chuva, Sensação) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-bold uppercase mb-1">
                <Wind className="w-3.5 h-3.5 text-ttnb-teal" />
                <span>VENTO</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ttnb-blue">
                {weather?.wind_speed_kmh || 18} km/h (LESTE)
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-bold uppercase mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>CHANCE DE CHUVA</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ttnb-blue">
                {weather?.rain_probability_percent || 20}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-bold uppercase mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>SENSAÇÃO TÉRMICA</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-ttnb-blue">
                {weather?.thermal_sensation_celsius || 31}°C
              </span>
            </div>
          </div>
        </div>

        {/* Previsão por Horário com rolagem horizontal touch fluida */}
        <div className="mt-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="font-bold text-ttnb-blue uppercase tracking-wide">
              Evolução horária hoje
            </span>
            <span className="text-xs text-slate-400 font-mono font-bold">SALVADOR</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {weather?.hourly_forecast?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl flex flex-col items-center hover:bg-slate-100/70 transition-colors"
              >
                <span className="text-xs text-slate-500 font-bold">{item.hour}</span>
                <CloudSun className="w-5 h-5 text-amber-500 my-1.5" />
                <span className="text-base font-bold text-ttnb-blue">{item.temperature}°C</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta Informativo Marítimo */}
        <div className="mt-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {weather?.maritime_alert ||
              'A Capitania dos Portos e a Astramab monitoram a tábua de marés continuamente. Em maré baixa severa em Mar Grande, as embarcações realizam atracação em terminais alternativos divulgados com antecedência.'}
          </p>
        </div>

        <p className="text-xs text-center text-slate-400 mt-5">
          {weather?.source ||
            'Dados integrados com Inmet, Capitania dos Portos e Estação Meteorológica TTNB'}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full sm:w-auto sm:min-w-[280px] mx-auto bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>Consultar Próximos Horários de Embarque</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
