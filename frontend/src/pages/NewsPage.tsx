import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Megaphone, Newspaper } from 'lucide-react';
import { api } from '../services/api';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      try {
        setLoading(true);
        const res = await api.get('/public/announcements');
        if (isMounted) {
          setNews(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar notícias', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-ttnb-teal text-xs font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5" />
            Central de Notícias
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ttnb-blue mt-1">
            Notícias & avisos oficiais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fique por dentro de alterações operacionais, manutenções, eventos náuticos e dicas de viagem.
          </p>
        </div>

        {/* Imagem Banner com Overlay */}
        <div className="mt-6 rounded-2xl overflow-hidden h-40 sm:h-52 border border-slate-200 relative shadow-xs">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="Baía de Todos os Santos"
            loading="lazy"
            decoding="async"
            width="1200"
            height="600"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4 sm:p-6">
            <div>
              <span className="bg-ttnb-orange text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                Operação 2026
              </span>
              <h2 className="text-white font-black text-lg sm:text-xl drop-shadow-xs mt-1">
                Travessia Segura e Ágil na Baía de Todos os Santos
              </h2>
            </div>
          </div>
        </div>

        {/* Loading ou Grid de Comunicados e Dicas */}
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400 text-xs font-medium">
            Carregando informes mais recentes...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-ttnb-blue/50 hover:shadow-sm transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-ttnb-teal uppercase tracking-wider bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Oficial TTNB
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-ttnb-blue leading-snug group-hover:text-ttnb-orange transition-colors">
                    {item.title}
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/horarios')}
                  className="mt-4 text-ttnb-orange hover:text-[#d96728] text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <span>{item.link_text}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full sm:w-auto sm:min-w-[280px] mx-auto bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>Comprar ou agendar passagem</span>
        </button>
      </div>
    </div>
  );
};
