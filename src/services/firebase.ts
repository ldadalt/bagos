// Configuração do Firebase

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Reduz logs verbosos do Firebase em desenvolvimento
if (import.meta.env.DEV) {
  // Suprime alguns warnings e erros comuns do Firebase relacionados a reconexão
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Função para verificar se é um erro de rede do Firebase
  const isFirebaseNetworkError = (message: string) => {
    return message.includes('WebChannelConnection') || 
           message.includes('transport errored') ||
           message.includes('ERR_INTERNET_DISCONNECTED') ||
           message.includes('Firestore') && message.includes('Listen') ||
           message.includes('Firestore') && message.includes('Write');
  };
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Não mostra warnings sobre transport errors do Firestore (reconexão automática)
    if (isFirebaseNetworkError(message)) {
      return; // Suprime esses warnings
    }
    originalWarn.apply(console, args);
  };
  
  // Suprime erros de rede do Firebase também (mas apenas os relacionados a reconexão)
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Não mostra erros de rede do Firebase (reconexão automática)
    if (isFirebaseNetworkError(message)) {
      return; // Suprime esses erros
    }
    originalError.apply(console, args);
  };
}

// Verifica se Firebase está configurado
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Verifica se já existe uma instância do Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Inicializa serviços do Firebase apenas se configurado
  auth = getAuth(app);
  db = getFirestore(app);
}

// Exporta serviços (podem ser null se Firebase não estiver configurado)
export { auth, db };

