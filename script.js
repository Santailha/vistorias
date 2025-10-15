// Importa o serviço de autenticação do seu arquivo de configuração
import { auth } from './firebase-config.js';

// Importa as funções de autenticação que vamos usar
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";


// --- LÓGICA REAL COM FIREBASE ---

// Seleciona os elementos da página
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');

// --- Funções de UI ---

// Função para mostrar o dashboard e esconder o login
function showDashboard(email) {
    userEmailDisplay.textContent = email;
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
}

// Função para mostrar o login e esconder o dashboard
function showLoginPage() {
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    loginForm.reset();
}

// --- Lógica de Autenticação ---

// 1. Observador de estado de autenticação (a forma moderna de gerenciar login)
// Esta função é chamada automaticamente quando o usuário faz login ou logout.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado.
        console.log("Usuário logado:", user.email);
        showDashboard(user.email);
    } else {
        // Usuário está deslogado.
        console.log("Nenhum usuário logado.");
        showLoginPage();
    }
});

// 2. Evento de submit do formulário de login
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Sucesso no login. O onAuthStateChanged vai cuidar de mostrar o dashboard.
            console.log("Login bem-sucedido!", userCredential.user);
        })
        .catch((error) => {
            // Erro no login.
            console.error("Erro no login:", error.code, error.message);
            alert("E-mail ou senha incorretos. Por favor, tente novamente.");
        });
});

// 3. Evento de clique no botão de logout
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            // Sucesso no logout. O onAuthStateChanged vai cuidar de mostrar a tela de login.
            console.log("Logout bem-sucedido!");
        })
        .catch((error) => {
            console.error("Erro no logout:", error);
            alert("Ocorreu um erro ao tentar sair.");
        });
});
