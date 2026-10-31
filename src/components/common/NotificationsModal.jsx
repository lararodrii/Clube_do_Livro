import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import ComradeCat from './ComradeCat';
import { 
  Bell, 
  Heart, 
  BookOpen, 
  Target, 
  Vote, 
  Calendar, 
  Check, 
  CheckCheck, 
  X, 
  Sparkles, 
  MessageSquare,
  Quote,
  BookPlus,
  Flame,
  Clock
} from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose, onNavigateTab }) {
  const { 
    notifications = [], 
    activeMember, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useClub();

  const [filter, setFilter] = useState('all'); // 'all', 'likes', 'activities'

  if (!isOpen) return null;

  // Filtragem
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'likes') return notif.type === 'quote_like';
    if (filter === 'activities') return notif.type !== 'quote_like';
    return true;
  });

  const unreadCount = notifications.filter(n => !(n.readBy || []).includes(activeMember?.id)).length;

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTab && onNavigateTab) {
      onNavigateTab(notif.linkTab);
    }
    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quote_like':
        return <Heart className="w-3.5 h-3.5 text-white fill-white" />;
      case 'new_quote':
        return <Quote className="w-3.5 h-3.5 text-white" />;
      case 'goal_completed':
        return <Target className="w-3.5 h-3.5 text-white" />;
      case 'ballot_nomination':
        return <Vote className="w-3.5 h-3.5 text-white" />;
      case 'meeting_confirm':
        return <Calendar className="w-3.5 h-3.5 text-white" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'quote_like':
        return 'bg-pink-600';
      case 'new_quote':
        return 'bg-amber-600';
      case 'goal_completed':
        return 'bg-emerald-600';
      case 'ballot_nomination':
        return 'bg-blue-600';
      case 'meeting_confirm':
        return 'bg-purple-600';
      default:
        return 'bg-theme-red';
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Hoje';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return 'Hoje';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:items-start p-3 sm:p-4 sm:pr-8 sm:pt-16 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-theme-container text-theme-primary rounded-2xl w-full max-w-sm sm:max-w-md border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] overflow-hidden animate-pop my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 bg-theme-card border-b-2 border-theme-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-red text-white flex items-center justify-center font-black border border-theme-border shadow-xs">
              <Bell className="w-4 h-4 text-[#FEF08A]" />
            </div>
            <div>
              <h3 className="font-headline font-black text-sm sm:text-base text-theme-primary leading-tight flex items-center gap-1.5">
                <span>Notificações do Coletivo</span>
                <span className="text-theme-red">★</span>
              </h3>
              <p className="text-[10px] text-theme-muted font-mono font-bold">
                {unreadCount > 0 ? `${unreadCount} novas atividades` : 'Tudo lido e em dia'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                title="Marcar todas como lidas"
                className="px-2 py-1 text-[10px] font-mono font-bold bg-theme-container hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary rounded-lg border border-theme-border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3 text-theme-red" />
                <span className="hidden xs:inline">Marcar lidas</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Fechar"
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-container border border-theme-border/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas de Filtro */}
        <div className="px-3 pt-2.5 pb-2 bg-theme-container/60 border-b border-theme-border/40 flex items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all border ${
              filter === 'all'
                ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('likes')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all border flex items-center gap-1 ${
              filter === 'likes'
                ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
            }`}
          >
            <Heart className="w-2.5 h-2.5" />
            <span>Curtidas ({notifications.filter(n => n.type === 'quote_like').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('activities')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all border flex items-center gap-1 ${
              filter === 'activities'
                ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Atividades</span>
          </button>
        </div>

        {/* Lista Rolável de Notificações */}
        <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto divide-y divide-theme-border/30 p-2 space-y-1.5 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 opacity-80">
                <ComradeCat pose="sleeping" size="sm" showBubble={false} />
              </div>
              <p className="text-xs font-headline font-bold text-theme-primary mb-1">
                Nenhuma notificação por aqui!
              </p>
              <p className="text-[11px] font-reading italic text-theme-muted max-w-xs mx-auto">
                O Gato Camarada está de vigília. Quando alguém curtir seus comentários ou bater metas, o alerta tocará aqui!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !(notif.readBy || []).includes(activeMember?.id);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer group text-left ${
                    isUnread
                      ? 'bg-theme-card border-theme-red shadow-[2px_2px_0px_var(--accent-red)]'
                      : 'bg-theme-container/80 hover:bg-theme-card border-theme-border/50 shadow-xs'
                  }`}
                >
                  {/* Avatar do Autor com Selo de Ação */}
                  <div className="relative shrink-0">
                    <img
                      src={notif.actorAvatar || '/avatars/gato1.jpg'}
                      alt={notif.actorName || 'Camarada'}
                      className="w-9 h-9 rounded-xl object-cover border-2 border-theme-border shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <span 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-theme-border shadow-xs ${getIconBg(notif.type)}`}
                      title={notif.type}
                    >
                      {getNotificationIcon(notif.type)}
                    </span>
                  </div>

                  {/* Conteúdo da Notificação */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="font-headline font-bold text-xs text-theme-primary truncate">
                        {notif.title}
                      </span>
                      <span className="text-[9px] font-mono text-theme-muted font-bold shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatRelativeTime(notif.createdAt)}</span>
                      </span>
                    </div>

                    <p className="text-[11px] font-reading font-medium text-theme-secondary leading-snug line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.linkTab && (
                      <span className="text-[9px] font-mono font-bold text-theme-red group-hover:underline inline-flex items-center gap-1 mt-1">
                        <span>Ver no aplicativo →</span>
                      </span>
                    )}
                  </div>

                  {/* Ponto de não lida */}
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-theme-red shrink-0 mt-1 animate-pulse" title="Não lida" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-2.5 bg-theme-card border-t border-theme-border text-center text-[10px] font-mono font-bold text-theme-muted">
          <span>★ Central de Alertas do Exército da Paty ★</span>
        </div>
      </div>
    </div>
  );
}
