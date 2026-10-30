import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { INITIAL_MEMBERS } from '../data/initialData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Controle do Modal de Autenticação Global
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login'); // 'login' | 'register' | 'forgot'

  // Listener oficial do Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          // Busca o perfil vinculado na coleção 'users' do Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          } else {
            // Fallback caso ainda não tenha documento: tenta associar pelo e-mail
            const fallbackMember = INITIAL_MEMBERS.find(m => m.email === firebaseUser.email) || INITIAL_MEMBERS[0];
            const profileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              memberId: fallbackMember.id,
              memberName: fallbackMember.name,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profileData, { merge: true });
            setUserProfile(profileData);
          }
        } catch (err) {
          console.warn('Erro ao carregar dados do usuário no Firestore:', err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Formatação de mensagens de erro amigáveis em português
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'O endereço de e-mail informado é inválido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos. Verifique suas credenciais.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado no coletivo. Tente fazer login ou recuperar a senha.';
      case 'auth/weak-password':
        return 'A senha deve conter no mínimo 6 caracteres para garantir sua segurança.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas malsucedidas. Por segurança, aguarde alguns instantes.';
      case 'auth/network-request-failed':
        return 'Falha de conexão com a rede. Verifique seu sinal de internet.';
      default:
        return 'Ocorreu um erro no acesso. Tente novamente.';
    }
  };

  // 1. Login com E-mail e Senha
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Carrega o perfil do usuário
      const userDocSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data());
      }
      setIsAuthModalOpen(false);
      setAuthModalReason('');
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { 
        success: false, 
        error: getFriendlyErrorMessage(error.code),
        rawError: error
      };
    }
  };

  // 2. Cadastro / Primeiro Acesso de Camarada (Vincula UID ao Membro no Firestore)
  const registerMember = async (email, password, memberId) => {
    try {
      const selectedMember = INITIAL_MEMBERS.find(m => m.id === memberId) || INITIAL_MEMBERS[0];
      
      // Cria a conta no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Atualiza o display name com o nome do membro
      try {
        await updateProfile(user, {
          displayName: selectedMember.name
        });
      } catch (pErr) {
        console.warn('Erro ao atualizar displayName:', pErr);
      }

      // Vincula na coleção 'users' com o UID
      const profileData = {
        uid: user.uid,
        email: email.trim(),
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        memberRole: selectedMember.roleBadge,
        memberAvatar: selectedMember.avatar,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      setUserProfile(profileData);

      // Também sincroniza a amarração de UID no documento principal do clube
      try {
        const clubeDocRef = doc(db, 'clube', 'clube_dados');
        const clubeDocSnap = await getDoc(clubeDocRef);
        if (clubeDocSnap.exists()) {
          const clubData = clubeDocSnap.data();
          const updatedMembers = (clubData.members || []).map(m => {
            if (m.id === selectedMember.id) {
              return { ...m, uid: user.uid, email: email.trim() };
            }
            return m;
          });
          await setDoc(clubeDocRef, { members: updatedMembers }, { merge: true });
        }
      } catch (syncErr) {
        console.warn('Erro ao sincronizar UID no documento do clube:', syncErr);
      }

      setIsAuthModalOpen(false);
      setAuthModalReason('');
      return { success: true, user, profile: profileData };
    } catch (error) {
      return { 
        success: false, 
        error: getFriendlyErrorMessage(error.code),
        rawError: error
      };
    }
  };

  // 3. Recuperação de Senha Oficial do Firebase
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { 
        success: true, 
        message: 'Link de redefinição enviado com sucesso! Verifique sua caixa de entrada e pasta de spam.' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: getFriendlyErrorMessage(error.code),
        rawError: error
      };
    }
  };

  // 4. Logout / Encerramento de Sessão
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Helper para abrir o modal com mensagem e aba inicial
  const openAuthModal = (reason = '', initialTab = 'login') => {
    setAuthModalReason(reason);
    setAuthModalInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  // Helper para proteger ações restritas a membros autenticados
  const requireAuth = (callback, reason = 'Faça login com seu perfil para participar das decisões do coletivo!') => {
    if (currentUser) {
      if (typeof callback === 'function') {
        callback();
      }
      return true;
    }
    openAuthModal(reason, 'login');
    return false;
  };

  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    loading,
    loginWithEmail,
    registerMember,
    resetPassword,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalReason,
    authModalInitialTab,
    openAuthModal,
    closeAuthModal,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
