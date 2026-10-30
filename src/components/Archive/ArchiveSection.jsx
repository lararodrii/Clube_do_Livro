import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import BookCover from '../common/BookCover';
import StarRating from '../common/StarRating';
import ComradeCat from '../common/ComradeCat';
import BookDetailsModal from './BookDetailsModal';
import { 
  Library, 
  Search, 
  Calendar, 
  Star, 
  MessageSquare, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

export default function ArchiveSection() {
  const { archive } = useClub();
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  // Filtragem dos livros por título, autor ou gênero
  const filteredBooks = (archive || []).filter(book => {
    const term = searchFilter.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.genre?.toLowerCase().includes(term) ||
      book.readMonth?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Acervo */}
      <div className="retro-card rounded-2xl p-6 sm:p-8 bg-white border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#1E1E1E]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D62828] border border-[#1E1E1E]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#D62828] flex items-center gap-1.5">
                <span>★</span> Biblioteca Histórica do Coletivo
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-[#141414] flex items-center gap-2">
              <span>Acervo & Leituras Concluídas</span>
              <span className="text-[#D62828]">★</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-xl font-reading font-semibold">
              Explore o histórico de livros debatidos pelo Exército da Paty, confira as notas atribuídas e edite suas resenhas críticas.
            </p>
          </div>

          {/* Campo de Busca no Acervo */}
          {archive.length > 0 && (
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por título, autor..."
                className="w-full text-xs sm:text-sm bg-[#FAF7F0] border-2 border-[#1E1E1E] rounded-xl pl-9 pr-3 py-2.5 text-[#141414] placeholder:text-stone-400 focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>
          )}
        </div>

        {/* Informações Rápidas */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E] font-medium font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#141414]">
            <span className="text-[#D62828]">★</span>
            <span>{archive.length} {archive.length === 1 ? 'livro arquivado' : 'livros arquivados'}</span>
          </span>
          <span className="font-reading italic text-[#57534E]">
            "Não vai lutar contra o fascismo?" — Resenhas abertas para debate e edição permanente
          </span>
        </div>
      </div>

      {/* Grid de Livros no Acervo OU Empty State com o Gato Camarada */}
      {archive.length === 0 ? (
        <div className="retro-card rounded-2xl p-10 sm:p-14 text-center bg-[#FAF7F0] border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E] flex flex-col items-center">
          <div className="mb-4">
            <ComradeCat pose="sleeping" size="lg" showBubble={false} />
          </div>
          <h3 className="font-headline font-black text-2xl text-[#141414] mb-2">
            O Acervo do Exército da Paty começa agora!
          </h3>
          <p className="text-sm text-[#57534E] max-w-md mx-auto mb-2 font-reading italic leading-relaxed">
            O Gato Camarada está descansando enquanto aguarda o primeiro livro concluído. Assim que a leitura de <strong>"Como as democracias morrem"</strong> for finalizada na reunião, ela será catalogada aqui com notas em estrelas e resenhas críticas de cada membro!
          </p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="retro-card text-center py-12 bg-white rounded-2xl border-2 border-[#1E1E1E] p-6 shadow-[4px_4px_0px_#1E1E1E]">
          <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h4 className="font-headline text-lg font-bold text-[#141414] mb-1">
            Nenhum livro encontrado
          </h4>
          <p className="text-xs text-[#57534E]">
            Tente buscar por outro termo ou limpe o campo de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const reviewsCount = book.reviews?.length || 0;
            const avgRating = reviewsCount > 0
              ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
              : '5.0';

            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="retro-card rounded-2xl p-5 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1E1E1E] transition-all flex flex-col justify-between bg-white border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E] group"
              >
                <div>
                  {/* Selo do Mês de Leitura */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FEF08A] text-[#141414] border border-[#1E1E1E] flex items-center gap-1 shadow-sm">
                      <span>★</span> {book.readMonth}
                    </span>
                    <span className="text-[11px] font-mono text-[#57534E] font-bold">
                      {book.pages} págs
                    </span>
                  </div>

                  {/* Capa e Dados */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="shrink-0">
                      <BookCover
                        src={book.coverUrl}
                        title={book.title}
                        author={book.author}
                        size="md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline text-base sm:text-lg font-black text-[#141414] group-hover:text-[#D62828] transition-colors leading-snug line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#D62828] font-reading font-bold italic mt-0.5 truncate">
                        por {book.author}
                      </p>

                      <div className="mt-3">
                        <StarRating 
                          rating={Number(avgRating)} 
                          size="sm" 
                          showValue={true}
                        />
                      </div>

                      <p className="text-[11px] text-[#57534E] line-clamp-2 mt-2 leading-relaxed font-reading">
                        {book.synopsis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t-2 border-[#1E1E1E] flex items-center justify-between text-xs font-mono font-bold text-[#141414]">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#D62828]" />
                    <span>{reviewsCount} {reviewsCount === 1 ? 'resenha' : 'resenhas'}</span>
                  </div>

                  <span className="text-[#D62828] group-hover:underline flex items-center gap-1 font-black">
                    Ver resenhas →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes e Resenhas */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />

    </div>
  );
}
