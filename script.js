// --- LÓGICA DE NAVEGAÇÃO SIMULADA ---

// Espera o DOM carregar completamente para garantir que todos os elementos existam
document.addEventListener('DOMContentLoaded', () => {
    // Selecionando os elementos da página
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const userEmailDisplay = document.getElementById('user-email-display');
    const emailInput = document.getElementById('email');

    // Função para mostrar o dashboard e esconder o login
    function showDashboard(email) {
        if (userEmailDisplay) {
            userEmailDisplay.textContent = email; // Mostra o e-mail do usuário no header
        }
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
    }

    // Função para mostrar o login e esconder o dashboard
    function showLoginPage() {
        loginPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
        if (loginForm) {
            loginForm.reset(); // Limpa o formulário de login
        }
    }

    // Evento de submit do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o recarregamento da página
            const userEmail = emailInput.value;
            // Por enquanto, qualquer login é válido.
            // No futuro, aqui entrará a chamada para o Firebase Auth.
            console.log(`Tentativa de login com: ${userEmail}`);
            showDashboard(userEmail);
        });
    }

    // Evento de clique no botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // No futuro, aqui entrará a chamada de signOut do Firebase.
            console.log('Usuário deslogado.');
            showLoginPage();
        });
    }
});
