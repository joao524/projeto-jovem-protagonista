import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, Wind, Droplets, Thermometer, Info, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const res = await api.get('/public/weather');
        setWeather(res.data);
      } catch (err) {
        console.error('Erro ao buscar clima', err);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            CONDIÇÕES NA CAPITAL
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            O tempo em Salvador.
          </h1>
        </div>

        {/* Card Principal do Clima Atual (Figma: Rectangle 20) */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#615f5e] font-bold">
            <span>{weather?.location || 'SALVADOR, BA'}</span>
            <span className="text-[#887878]">{weather?.date_time || 'HOJE 14:00'}</span>
          </div>

          <div className="flex items-center space-x-4 my-3">
            <CloudSun className="w-12 h-12 text-amber-500" />
            <div>
              <span className="text-[42px] font-bold text-ttnb-blue leading-none">
                {weather?.temperature_celsius || 28}°
              </span>
              <p className="text-[12px] font-semibold text-[#615f5e] mt-0.5">
                {weather?.condition || 'Parcialmente nublado'}
              </p>
            </div>
          </div>

          <div className="my-3 border-t border-[#f0ece9]"></div>

          {/* Métricas Marítimas (Vento, Chuva, Sensação) */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 bg-slate-50 rounded-sm">
              <span className="text-[10px] text-[#887878] uppercase block font-semibold">
                VENTO
              </span>
              <span className="text-[13px] font-bold text-ttnb-blue mt-0.5 block">
                {weather?.wind_speed_kmh || 18} km/h
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-sm">
              <span className="text-[10px] text-[#887878] uppercase block font-semibold">
                CHUVA
              </span>
              <span className="text-[13px] font-bold text-ttnb-blue mt-0.5 block">
                {weather?.rain_probability_percent || 20}%
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-sm">
              <span className="text-[10px] text-[#887878] uppercase block font-semibold">
                SENSAÇÃO
              </span>
              <span className="text-[13px] font-bold text-ttnb-blue mt-0.5 block">
                {weather?.thermal_sensation_celsius || 31}°C
              </span>
            </div>
          </div>
        </div>

        {/* Card Próximas Horas (Figma: Rectangle 20) */}
        <div className="mt-3.5 bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
          <div className="flex justify-between items-center text-[11px] mb-3">
            <span className="font-bold text-ttnb-blue">Próximas horas</span>
            <span className="text-[10px] text-[#887878] font-bold">HOJE</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {weather?.hourly_forecast?.map((item: any, idx: number) => (
              <div key={idx} className="p-2 bg-slate-50 rounded flex flex-col items-center">
                <span className="text-[11px] text-[#615f5e] font-semibold">{item.hour}</span>
                <CloudSun className="w-4 h-4 text-amber-500 my-1" />
                <span className="text-[13px] font-bold text-ttnb-blue">{item.temperature}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta Informativo Marítimo (Figma: Rectangle 22 + i) */}
        <div className="mt-3.5 bg-amber-50/70 border border-amber-200 rounded-md p-3 flex items-start space-x-2.5 text-[11px] text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {weather?.maritime_alert ||
              'Chuvas fortes e condições do mar podem alterar as travessias.'}
          </p>
        </div>

        <p className="text-[10px] text-center text-[#887878] mt-4">
          {weather?.source ||
            'Dados disponibilizados pelo Instituto Nacional de Meteorologia (INMET)'}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Consultar horários</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
