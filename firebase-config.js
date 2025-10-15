// Importe as funções dos SDKs do Firebase que você precisa
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// TODO: Adicione a configuração do seu projeto Firebase aqui
// As informações abaixo você encontra nas configurações do seu projeto no console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu3Jg0UXLZm2KkPjtKfT3S8HvRDjHDetI",
  authDomain: "vistorias-1b0a1.firebaseapp.com",
  projectId: "vistorias-1b0a1",
  storageBucket: "vistorias-1b0a1.firebasestorage.app",
  messagingSenderId: "753055318081",
  appId: "1:753055318081:web:62ce8e8fa5280c8c7886c0"
};
// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte os serviços do Firebase que você usará em outras partes do seu projeto
// Estamos exportando o serviço de Autenticação (auth), o banco de dados (db) e o armazenamento (storage)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
