// Importa o serviço de autenticação do seu arquivo de configuração
import { auth } from './firebase-config.js';

// Importa as funções de autenticação que vamos usar
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";


// =================================================================
//  ESTADO DA APLICAÇÃO
// =================================================================
// TODO: Substituir estes dados simulados pela chamada à API da Rede Vistorias.
// A integração irá popular esta variável `vistorias` com os dados reais.
let vistorias = [
    { id: 1, codigoImovel: 'SC-101', endereco: 'Rua das Flores, 123, Centro', tipo: 'Entrada', dataAgendamento: '2025-10-20', locatario: 'João da Silva', status: 'Pendente de Análise', linkRelatorio: 'https://santailha.github.io/manutencao/vistoria', history: [{date: '2025-10-18', event: 'Agendamento realizado pelo setor Administrativo.'}] },
    { id: 2, codigoImovel: 'SC-202', endereco: 'Av. Beira Mar, 456, Coqueiros', tipo: 'Saída', dataAgendamento: '2025-10-22', locatario: 'Maria Oliveira', status: 'Em Contestação', linkRelatorio: '#', history: [{date: '2025-10-21', event: 'Laudo recebido.'}, {date: '2025-10-22', event: 'Contestação recebida do locatário.'}] },
    { id: 3, codigoImovel: 'SC-303', endereco: 'Rua do Sol, 789, Itacorubi', tipo: 'Entrada', dataAgendamento: '2025-09-15', locatario: 'Carlos Pereira', status: 'Concluída', linkRelatorio: '#', history: [{date: '2025-09-15', event: 'Vistoria aprovada e anexada ao Bitrix.'}] },
];
let currentVistoriaId = null;
let currentStatusFilter = 'Todos';


// =================================================================
//  SELETORES DE ELEMENTOS DO DOM
// =================================================================
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const detailsPage = document.getElementById('details-page');
const loginForm = document.getElementById('login-form');
const logoutButtons = document.querySelectorAll('.logout-button');
const userEmailDisplays = document.querySelectorAll('.user-email-display');
const vistoriaList = document.getElementById('vistoria-list');
const statusFilters = document.querySelectorAll('.status-filter');
const backToDashboardBtn = document.getElementById('back-to-dashboard');


// =================================================================
//  FUNÇÕES DE RENDERIZAÇÃO E UI
// =================================================================

// Mapeia o status para a classe CSS do "badge"
const statusClassMap = {
    'Pendente de Análise': 'status-Pendente',
    'Em Contestação': 'status-Contestacao',
    'Concluída': 'status-Concluida',
    'Agendada': 'status-Agendada'
};

/**
 * Renderiza a lista de vistorias na tabela do dashboard
 */
function renderVistorias() {
    vistoriaList.innerHTML = ''; // Limpa a lista
    
    const filteredVistorias = vistorias.filter(v => 
        currentStatusFilter === 'Todos' || v.status === currentStatusFilter
    );

    if (filteredVistorias.length === 0) {
        vistoriaList.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-500">Nenhuma vistoria encontrada para este status.</td></tr>`;
        return;
    }

    filteredVistorias.forEach(vistoria => {
        const statusClass = statusClassMap[vistoria.status] || 'bg-gray-500';
        const row = `
            <tr class="hover:bg-gray-700/50">
                <td class="py-4 px-6 font-medium">${vistoria.codigoImovel}</td>
                <td class="py-4 px-6 hidden md:table-cell">${vistoria.endereco}</td>
                <td class="py-4 px-6">${vistoria.tipo}</td>
                <td class="py-4 px-6 hidden sm:table-cell">${new Date(vistoria.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td class="py-4 px-6">
                    <span class="text-xs font-semibold py-1 px-3 rounded-full status-badge ${statusClass}">${vistoria.status}</span>
                </td>
                <td class="py-4 px-6 text-center">
                    <button class="font-medium text-custom-yellow hover:underline view-details-btn" data-id="${vistoria.id}">Ver Detalhes</button>
                </td>
            </tr>
        `;
        vistoriaList.innerHTML += row;
    });
}

/**
 * Popula a página de detalhes com os dados da vistoria selecionada
 */
function populateDetailsPage() {
    const vistoria = vistorias.find(v => v.id === currentVistoriaId);
    if (!vistoria) return;

    document.getElementById('details-codigo').textContent = vistoria.codigoImovel;
    document.getElementById('details-endereco').textContent = vistoria.endereco;
    document.getElementById('details-tipo').textContent = vistoria.tipo;
    document.getElementById('details-data').textContent = new Date(vistoria.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR');
    document.getElementById('details-locatario').textContent = vistoria.locatario;
    
    const statusBadge = document.getElementById('details-status-badge');
    statusBadge.textContent = vistoria.status;
    statusBadge.className = `text-xs font-semibold py-1 px-3 rounded-full status-badge ${statusClassMap[vistoria.status]}`;

    document.getElementById('action-download-report').href = vistoria.linkRelatorio;

    const historyList = document.getElementById('details-history');
    historyList.innerHTML = '';
    vistoria.history.forEach(item => {
        historyList.innerHTML += `<li><strong>${new Date(item.date).toLocaleDateString('pt-BR')}:</strong> ${item.event}</li>`;
    });
}


// =================================================================
//  FUNÇÕES DE NAVEGAÇÃO
// =================================================================
function showLoginPage() {
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    detailsPage.classList.add('hidden');
}

function showDashboard(email) {
    userEmailDisplays.forEach(el => el.textContent = email);
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    detailsPage.classList.add('hidden');
    renderVistorias();
}

function showDetailsPage() {
    dashboardPage.classList.add('hidden');
    detailsPage.classList.remove('hidden');
    populateDetailsPage();
}


// =================================================================
//  LÓGICA DE AUTENTICAÇÃO E EVENTOS
// =================================================================

// Observador de estado de autenticação
onAuthStateChanged(auth, user => {
    if (user) {
        showDashboard(user.email);
    } else {
        showLoginPage();
    }
});

// Evento de login
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(err => alert("Erro no login: " + err.message));
});

// Evento de logout
logoutButtons.forEach(btn => btn.addEventListener('click', () => signOut(auth)));

// Evento de clique nos filtros de status
statusFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        statusFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentStatusFilter = filter.dataset.status;
        renderVistorias();
    });
});

// Evento de clique para ver detalhes (usando delegação de evento)
vistoriaList.addEventListener('click', e => {
    if (e.target.classList.contains('view-details-btn')) {
        currentVistoriaId = parseInt(e.target.dataset.id);
        showDetailsPage();
    }
});

// Evento para voltar ao dashboard
backToDashboardBtn.addEventListener('click', () => showDashboard(auth.currentUser.email));


// Inicialização da primeira renderização
document.addEventListener('DOMContentLoaded', () => {
    if (auth.currentUser) {
        renderVistorias();
    }
});
