import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import BookCover from '../common/BookCover';
import StarRating from '../common/StarRating';
import ComradeCat from '../common/ComradeCat';
import BookDetailsModal from './BookDetailsModal';
import { formatTextWithBold } from '../../utils/textFormat';
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
      <div className="retro-card rounded-2xl p-3.5 sm:p-8 bg-theme-container border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-theme-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-theme-red border border-theme-border" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-theme-red flex items-center gap-1.5">
                <span>★</span> Biblioteca Histórica do Coletivo
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-theme-primary flex items-center gap-2">
              <span>Acervo & Leituras Concluídas</span>
              <span className="text-theme-red">★</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-muted mt-1 max-w-xl font-reading font-semibold">
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
                className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-9 pr-3 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
            </div>
          )}
        </div>

        {/* Informações Rápidas */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-theme-muted font-medium font-mono">
          <span className="flex items-center gap-1.5 font-bold text-theme-primary">
            <span className="text-theme-red">★</span>
            <span>{archive.length} {archive.length === 1 ? 'livro arquivado' : 'livros arquivados'}</span>
          </span>
          <span className="font-reading italic text-theme-muted">
            "Não vai lutar contra o fascismo?" — Resenhas abertas para debate e edição permanente
          </span>
        </div>
      </div>

      {/* Grid de Livros no Acervo OU Empty State Padronizado com o Gato Camarada */}
      {archive.length === 0 ? (
        <div className="retro-card rounded-2xl p-8 sm:p-12 text-center bg-theme-card border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] flex flex-col items-center">
          <div className="mb-3">
            <ComradeCat 
              pose="reading" 
              size="lg" 
              showBubble={true}
              customQuote="Livros concluídos viram patrimônio revolucionário no acervo!"
              bubblePosition="top"
            />
          </div>
          <h3 className="font-headline font-black text-2xl text-theme-primary mb-2 mt-2">
            O Acervo do Exército da Paty começa agora!
          </h3>
          <p className="text-sm text-theme-muted max-w-lg mx-auto mb-4 font-reading italic leading-relaxed">
            O Gato Camarada está organizando as estantes da nossa biblioteca. Assim que a assembleia de debate for realizada, o livro atual será catalogado aqui com avaliações em estrelas, resenhas de cada camarada e histórico permanente.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#FEF08A] px-4 py-2 rounded-xl border-2 border-theme-border text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_var(--shadow-color)]">
            <span className="text-theme-red">★</span>
            <span>Leitura atual em andamento pelo comitê</span>
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="retro-card text-center py-10 bg-theme-card rounded-2xl border-2 border-theme-border p-6 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col items-center">
          <div className="mb-2">
            <ComradeCat pose="curious" size="sm" showBubble={false} />
          </div>
          <h4 className="font-headline text-lg font-bold text-theme-primary mb-1">
            Nenhum livro encontrado
          </h4>
          <p className="text-xs text-theme-muted font-reading">
            O Gato Camarada farejou por todas as estantes e não encontrou essa obra. Tente buscar por outro termo ou limpe o campo de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const reviewsCount = book.reviews?.length || 0;
            const avgRating = reviewsCount > 0
              ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
              : '5.0';

            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="retro-card rounded-2xl p-5 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_var(--shadow-color)] transition-all flex flex-col justify-between bg-theme-card border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] group"
              >
                <div>
                  {/* Selo do Mês de Leitura e Status Concluído */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FEF08A] text-[#111111] border border-theme-border flex items-center gap-1 shadow-sm font-bold">
                        <span>★</span> {book.readMonth}
                      </span>
                      {book.status && (
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#283618] text-[#FEF08A] border border-theme-border shadow-sm">
                          {book.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-theme-muted font-bold block">
                        {book.pages} págs
                      </span>
                      {book.assemblyDate && (
                        <span className="text-[9px] font-mono text-theme-red font-bold block">
                          {book.assemblyDate}
                        </span>
                      )}
                    </div>
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
                      <h3 className="font-headline text-base sm:text-lg font-black text-theme-primary group-hover:text-theme-red transition-colors leading-snug line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-theme-red font-reading font-bold italic mt-0.5 truncate">
                        por {book.author}
                      </p>

                      <div className="mt-3">
                        <StarRating 
                          rating={Number(avgRating)} 
                          size="sm" 
                          showValue={true}
                        />
                      </div>

                      <p className="text-[11px] text-theme-secondary line-clamp-2 mt-2 leading-relaxed font-reading whitespace-pre-line">
                        {formatTextWithBold(book.synopsis)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t-2 border-theme-border flex items-center justify-between text-xs font-mono font-bold text-theme-primary">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-theme-red" />
                    <span>{reviewsCount} {reviewsCount === 1 ? 'resenha' : 'resenhas'}</span>
                  </div>

                  <span className="text-theme-red group-hover:underline flex items-center gap-1 font-black">
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
