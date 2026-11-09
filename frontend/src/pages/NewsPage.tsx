import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await api.get('/public/announcements');
        setNews(res.data);
      } catch (err) {
        console.error('Erro ao buscar notícias', err);
      }
    }
    loadNews();
  }, []);

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            FIQUE POR DENTRO
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            Notícias & avisos.
          </h1>
        </div>

        {/* Imagem Banner */}
        <div className="mt-4 rounded-ttnb-card overflow-hidden h-36 border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            alt="Baía e Mar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Feed de Comunicados e Dicas */}
        <div className="mt-4 space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-ttnb-border rounded-md p-4 shadow-2xs hover:border-ttnb-blue transition-colors text-left"
            >
              <p className="text-[10px] font-bold text-ttnb-teal uppercase tracking-wider">
                {item.category}
              </p>
              <h2 className="text-[14px] font-bold text-ttnb-blue mt-1 leading-snug">
                {item.title}
              </h2>
              <button
                onClick={() => navigate('/horarios')}
                className="mt-3 text-ttnb-orange hover:text-[#d96728] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{item.link_text}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Comprar passagem</span>
        </button>
      </div>
    </div>
  );
};
