import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClub } from '../../context/ClubContext';
import ComradeCat from '../common/ComradeCat';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  Check, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalReason, 
    authModalInitialTab,
    loginWithEmail, 
    registerMember, 
    resetPassword 
  } = useAuth();

  const { members, triggerComradeConfetti, showToast } = useClub();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Estados do formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Estados do formulário de cadastro
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('m1');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Estados do formulário de recuperação
  const [resetEmail, setResetEmail] = useState('');

  // Estados de feedback e carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sincroniza a aba inicial sempre que o modal for aberto
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalInitialTab || 'login');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  if (!isAuthModalOpen) return null;

  // === SUBMIT LOGIN ===
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const result = await loginWithEmail(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success) {
      if (triggerComradeConfetti) triggerComradeConfetti(60);
      showToast('Bem-vinda de volta à assembleia, camarada! ★🐾', 'success');
    } else {
      setErrorMessage(result.error);
    }
  };

  // === SUBMIT REGISTRO ===
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('A senha precisa conter no mínimo 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    setIsLoading(true);
    const result = await registerMember(regEmail, regPassword, selectedMemberId);
    setIsLoading(false);

    if (result.success) {
      if (triggerComradeConfetti) triggerComradeConfetti(120);
      showToast('Conta criada com sucesso! Vinculação efetuada no comitê ★🐾', 'pink');
    } else {
      setErrorMessage(result.error);
    }
  };

  // === SUBMIT RECUPERAÇÃO ===
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const result = await resetPassword(resetEmail);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      showToast('E-mail de redefinição enviado com sucesso!', 'info');
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      
      {/* Container Principal do Modal Estilo Pôster Editorial Retrô */}
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Topo do Modal com o Gato Camarada e Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-4 mb-4 border-b-2 border-theme-border relative z-10">
          <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
            <div className="shrink-0">
              <ComradeCat 
                pose={activeTab === 'register' ? 'celebrating' : activeTab === 'forgot' ? 'curious' : 'reading'} 
                size="sm" 
                showBubble={false}
                className="scale-90"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-theme-red mb-0.5 flex-wrap">
                <span>★</span>
                <span>Comitê do Exército da Paty</span>
              </div>
              <h3 className="font-headline font-black text-xl sm:text-2xl text-theme-primary leading-tight">
                Acesso das Camaradas ★
              </h3>
              <p className="text-xs text-theme-muted font-reading font-semibold italic mt-0.5">
                "Não vai lutar contra o fascismo?" • Autenticação Coletiva
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeAuthModal(); }}
            title="Fechar modal"
            className="shrink-0 z-30 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer text-theme-muted hover:text-theme-primary border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Aviso de Ação Protegida (se invocado por clique em ação restrita) */}
        {authModalReason && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FEF08A] text-[#111111] font-bold border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] flex items-start gap-2.5 animate-pop">
            <ShieldCheck className="w-4 h-4 text-theme-red shrink-0 mt-0.5" />
            <div className="text-xs font-mono font-black">
              <span className="text-theme-red uppercase block text-[10px]">Ação Restrita a Membros:</span>
              <span>{authModalReason}</span>
            </div>
          </div>
        )}

        {/* Navegação entre as Abas (Login / Cadastro / Recuperar) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-theme-page rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 px-2 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-theme-red text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-theme-muted hover:text-theme-primary hover:bg-theme-card'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 px-2 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-theme-red text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-theme-muted hover:text-theme-primary hover:bg-theme-card'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastro</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 px-2 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'forgot'
                ? 'bg-theme-red text-white shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'text-theme-muted hover:text-theme-primary hover:bg-theme-card'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Senha</span>
          </button>
        </div>

        {/* Mensagens de Erro e Sucesso */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-theme-red/10 text-theme-red border-2 border-theme-red shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-2 text-xs font-mono font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-theme-gold/10 text-theme-gold border-2 border-theme-gold shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-2 text-xs font-mono font-bold animate-fade-in">
            <Check className="w-4 h-4 shrink-0 text-theme-gold" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* === ABA 1: LOGIN === */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                E-mail da Camarada *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="camarada@exercitodapaty.com"
                  className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                />
                <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider">
                  Senha Secreta *
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] font-mono font-bold text-theme-red hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-10 pr-10 py-2.5 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                />
                <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-theme-muted hover:text-theme-primary"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Autenticando camarada...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#FEF08A]" />
                  <span>Entrar na Assembleia ★</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-theme-muted font-reading">
                Ainda não tem acesso cadastrado?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-theme-gold font-bold underline font-mono"
                >
                  Cadastre sua camarada aqui
                </button>
              </p>
            </div>
          </form>
        )}

        {/* === ABA 2: CADASTRO / PRIMEIRO ACESSO === */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Seletor Visual dos 6 Membros Oficiais */}
            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Qual camarada é você? *</span>
                <span className="text-[10px] text-theme-gold font-bold">Vincular meu perfil</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((m) => {
                  const isSelected = selectedMemberId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`cursor-pointer p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 select-none relative ${
                        isSelected
                          ? 'border-theme-red bg-theme-red/10 shadow-[3px_3px_0px_var(--accent-red)]'
                          : 'border-theme-border bg-theme-card hover:bg-theme-input shadow-[2px_2px_0px_var(--shadow-color)]'
                      }`}
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-lg object-cover border border-theme-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-headline font-bold truncate leading-tight ${isSelected ? 'text-theme-red' : 'text-theme-primary'}`}>
                          {m.name.split(' ')[0]}
                        </p>
                        <p className="text-[9px] text-theme-muted font-mono truncate">
                          {m.nickname ? `"${m.nickname.split(' ')[0]}"` : m.roleBadge.split(' ')[1]}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-theme-red text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                E-mail para Acesso *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu-email@gmail.com"
                  className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                />
                <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                  Criar Senha *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mín. 6 dígitos"
                    className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-9 pr-8 py-2 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                  />
                  <Lock className="w-3.5 h-3.5 text-theme-muted absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-2.5 text-theme-muted hover:text-theme-primary"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-9 pr-3 py-2 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                  />
                  <Check className="w-3.5 h-3.5 text-theme-muted absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Cadastrando e vinculando...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#FEF08A]" />
                  <span>Cadastrar e Entrar no Coletivo ★</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-theme-muted font-reading">
                Já possui conta cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-theme-red font-bold underline font-mono"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        )}

        {/* === ABA 3: RECUPERAR SENHA === */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-theme-muted font-reading leading-relaxed mb-3">
                Informe o e-mail da sua conta cadastrada. O Firebase enviará um link oficial e seguro diretamente para sua caixa de entrada para você redefinir sua senha.
              </p>
              
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Seu E-mail Cadastrado *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="camarada@exercitodapaty.com"
                  className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl pl-10 pr-3.5 py-2.5 text-theme-primary focus:outline-none font-mono placeholder:text-theme-muted"
                />
                <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Enviando link de redefinição...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#FEF08A]" />
                  <span>Enviar Link de Recuperação ★</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-mono font-bold text-theme-red hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <span>Voltar para tela de login</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
