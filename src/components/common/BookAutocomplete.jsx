import React, { useState, useEffect, useRef } from 'react';
import { searchBooks } from '../../services/bookSearch';
import { Search, Loader2, X, BookOpen, Sparkles } from 'lucide-react';

/**
 * Componente Reutilizável de Autocomplete Inteligente Multi-API de Livros
 * Busca com debounce de 300ms em Open Library, Google Books e Apple Books JSONP.
 */
export default function BookAutocomplete({
  value = '',
  onChange,
  onSelectBook,
  placeholder = 'Digite o título da obra para buscar em tempo real...',
  label = 'Título da Obra / Busca Automática Multi-API *',
  required = true,
  id = 'book-search-autocomplete'
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sincroniza query com o valor controlado quando muda externamente
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const items = await searchBooks(searchTerm);
      setResults(items);
      setIsOpen(items.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) {
      onChange(text);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length >= 2) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        executeSearch(text);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  };

  const handleSelect = (book) => {
    setQuery(book.title);
    setIsOpen(false);
    if (onChange) {
      onChange(book.title);
    }
    if (onSelectBook) {
      onSelectBook(book);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      executeSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onChange) {
      onChange('');
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'apple':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30 font-bold">Apple Books HD</span>;
      case 'google':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold">Google Books</span>;
      case 'openlibrary':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">Open Library</span>;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label 
            htmlFor={id} 
            className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider"
          >
            {label}
          </label>
          <span className="text-[10px] text-theme-muted font-reading italic hidden sm:inline">
            Autocomplete Multi-API (digite 3+ letras)
          </span>
        </div>
      )}

      {/* Input de Busca com Ícones */}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-9 pr-16 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red transition-all"
        />

        {/* Ícone de Busca à Esquerda */}
        <div className="absolute left-3 pointer-events-none text-theme-muted">
          <Search className="w-4 h-4" />
        </div>

        {/* Ações à Direita: Spinner / Botão Limpar / Botão Buscar */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-theme-red animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              title="Limpar campo"
              className="p-1 rounded-md text-theme-muted hover:text-theme-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleManualSearch}
            title="Buscar livros"
            className="p-1 rounded-md text-theme-red hover:bg-theme-container transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dropdown Flutuante de Autocomplete */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-theme-card rounded-2xl border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] max-h-80 overflow-y-auto divide-y divide-theme-border/30 animate-fade-in">
          
          <div className="p-2 bg-theme-container/70 border-b border-theme-border flex items-center justify-between text-[10px] font-mono font-bold text-theme-muted px-3">
            <span className="flex items-center gap-1 text-theme-primary">
              <Sparkles className="w-3 h-3 text-theme-gold" />
              <span>{results.length} SUGESTÕES ENCONTRADAS</span>
            </span>
            <span>Clique para autopreencher</span>
          </div>

          {results.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => handleSelect(book)}
              className="w-full p-2.5 sm:p-3 text-left hover:bg-theme-container transition-colors flex items-center gap-3 group"
            >
              {/* Miniatura da Capa */}
              <div className="w-10 h-14 shrink-0 rounded bg-theme-container border border-theme-border overflow-hidden shadow-sm">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Informações da Obra */}
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-xs sm:text-sm text-theme-primary truncate leading-tight group-hover:text-theme-red transition-colors">
                  {book.title}
                </p>
                <p className="text-xs text-theme-secondary font-reading italic truncate mt-0.5">
                  {book.author}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-theme-muted">
                  <span className="font-bold text-theme-gold">
                    {book.pages} págs
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{book.genre}</span>
                  {getSourceBadge(book.source)}
                </div>
              </div>

              <div className="shrink-0 text-theme-muted group-hover:text-theme-red group-hover:translate-x-0.5 transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Feedback quando busca não encontra nada */}
      {hasSearched && !isSearching && results.length === 0 && query.trim().length >= 3 && isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 p-3 bg-theme-card rounded-xl border-2 border-theme-border shadow-lg text-xs font-reading italic text-theme-muted">
          Nenhuma obra encontrada automaticamente. Você pode preencher os campos abaixo manualmente!
        </div>
      )}
    </div>
  );
}
