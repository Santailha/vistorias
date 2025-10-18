// Importa os serviços do Firebase
import { auth, db } from './firebase-config.js';

// Importa as funções de autenticação
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Importa as funções do Firestore
import {
    collection,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";


// =================================================================
//  ESTADO DA APLICAÇÃO
// =================================================================
let vistorias = [];
let currentVistoriaId = null;
let currentStatusFilter = 'Todos';


// =================================================================
//  MAPEAMENTOS E TRADUÇÕES
// =================================================================
const statusClassMap = {
    'Pendente de Análise': 'status-Pendente',
    'Em Contestação': 'status-Contestacao',
    'Concluída': 'status-Concluida',
    'Agendada': 'status-Agendada',
    'ASSIGNED': 'status-Agendada',
    'FINISHED': 'status-Concluida',
    'REJECTED': 'status-Contestacao',
    'ACCEPTED': 'status-Pendente',
    'Rejeitada': 'status-Contestacao',
    'Aceita': 'status-Pendente'
};

const statusTranslate = {
    'ASSIGNED': 'Agendada',
    'FINISHED': 'Concluída',
    'REJECTED': 'Rejeitada',
    'ACCEPTED': 'Aceita',
    'Pendente de Análise': 'Pendente de Análise',
    'Em Contestação': 'Em Contestação',
    'Concluída': 'Concluída',
    'Agendada': 'Agendada'
};


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
const newVistoriaModal = document.getElementById('new-vistoria-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const newVistoriaForm = document.getElementById('new-vistoria-form');


// =================================================================
//  LÓGICA DE DADOS (FIREBASE)
// =================================================================
async function fetchVistorias() {
    try {
        const vistoriasCol = collection(db, 'vistorias');
        const vistoriaSnapshot = await getDocs(vistoriasCol);
        vistorias = vistoriaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Erro ao buscar vistorias: ", error);
        alert("Não foi possível carregar os dados. Verifique as regras de segurança do Firestore.");
    }
}

async function fetchAndRenderVistorias() {
    await fetchVistorias();
    renderVistorias();
}


// =================================================================
//  FUNÇÕES DE RENDERIZAÇÃO E UI
// =================================================================
function renderVistorias() {
    vistoriaList.innerHTML = '';

    const filteredVistorias = vistorias.filter(vistoria => {
        const translatedStatus = statusTranslate[vistoria.status] || vistoria.status;
        return currentStatusFilter === 'Todos' || translatedStatus === currentStatusFilter;
    });

    if (filteredVistorias.length === 0) {
        vistoriaList.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-500">Nenhuma vistoria encontrada.</td></tr>`;
        return;
    }

    filteredVistorias.forEach(vistoria => {
        const translatedStatus = statusTranslate[vistoria.status] || vistoria.status;
        const statusClass = statusClassMap[vistoria.status] || 'bg-gray-500';
        const dataFormatada = vistoria.dataAgendamento ? new Date(vistoria.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Aguardando';
        const precoFormatado = vistoria.preco ? `R$ ${parseFloat(vistoria.preco).toFixed(2).replace('.', ',')}` : '-';

        const codigoHtml = vistoria.linkPagina
            ? `<a href="https://${vistoria.linkPagina}" target="_blank" class="text-custom-yellow hover:underline">${vistoria.codigoImovel}</a>`
            : `${vistoria.codigoImovel}`;

        // *** NOVA LÓGICA PARA O BOTÃO DO LAUDO ***
        let acoesHtml = `<button class="font-medium text-custom-yellow hover:underline view-details-btn" data-id="${vistoria.id}">Ver Detalhes</button>`;
        if (vistoria.linkRelatorio) {
            acoesHtml += ` | <a href="${vistoria.linkRelatorio}" target="_blank" class="font-medium text-blue-400 hover:underline">Ver Laudo</a>`;
        }

        const row = `
            <tr class="hover:bg-gray-700/50">
                <td class="py-4 px-6 font-medium">${codigoHtml}</td>
                <td class="py-4 px-6 hidden md:table-cell">${vistoria.endereco || 'Não informado'}</td>
                <td class="py-4 px-6">${vistoria.tipo}</td>
                <td class="py-4 px-6 hidden sm:table-cell">${dataFormatada}</td>
                <td class="py-4 px-6 font-medium">${precoFormatado}</td>
                <td class="py-4 px-6">
                    <span class="text-xs font-semibold py-1 px-3 rounded-full status-badge ${statusClass}">${translatedStatus}</span>
                </td>
                <td class="py-4 px-6 text-center">${acoesHtml}</td>
            </tr>
        `;
        vistoriaList.innerHTML += row;
    });
}

function populateDetailsPage() {
    const vistoria = vistorias.find(v => v.id === currentVistoriaId);
    if (!vistoria) return;

    document.getElementById('details-codigo').textContent = vistoria.codigoImovel;
    document.getElementById('details-endereco').textContent = vistoria.endereco || 'Não informado';
    document.getElementById('details-tipo').textContent = vistoria.tipo;
    document.getElementById('details-data').textContent = vistoria.dataAgendamento ? new Date(vistoria.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Aguardando';
    document.getElementById('details-locatario').textContent = vistoria.locatario || 'Não informado';
    document.getElementById('details-preco').textContent = vistoria.preco ? `R$ ${parseFloat(vistoria.preco).toFixed(2).replace('.', ',')}` : '-';
    document.getElementById('details-franquia').textContent = vistoria.franquia || 'Não informada';

    const translatedStatus = statusTranslate[vistoria.status] || vistoria.status;
    const statusBadge = document.getElementById('details-status-badge');
    statusBadge.textContent = translatedStatus;
    statusBadge.className = `text-xs font-semibold py-1 px-3 rounded-full status-badge ${statusClassMap[vistoria.status] || 'bg-gray-500'}`;

    const downloadButton = document.getElementById('action-download-report');
    if (vistoria.linkRelatorio) {
        downloadButton.href = vistoria.linkRelatorio;
        downloadButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        downloadButton.href = '#';
        downloadButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const historyList = document.getElementById('details-history');
    historyList.innerHTML = '';
    if (vistoria.history && Array.isArray(vistoria.history)) {
        vistoria.history.forEach(item => {
            const dataEvento = item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'Data';
            historyList.innerHTML += `<li><strong>${dataEvento}:</strong> ${item.event}</li>`;
        });
    }
    if (vistoria.observacao) {
        historyList.innerHTML += `<li class="text-yellow-400"><strong>Observação da API:</strong> ${vistoria.observacao}</li>`;
    }
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
    fetchAndRenderVistorias();
}

function showDetailsPage() {
    dashboardPage.classList.add('hidden');
    detailsPage.classList.remove('hidden');
    populateDetailsPage();
}


// =================================================================
//  LÓGICA DE AUTENTICAÇÃO E EVENTOS
// =================================================================
onAuthStateChanged(auth, user => {
    if (user) {
        showDashboard(user.email);
    } else {
        showLoginPage();
    }
});

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(err => alert("Erro no login: " + err.message));
});

logoutButtons.forEach(btn => btn.addEventListener('click', () => signOut(auth)));

statusFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        statusFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentStatusFilter = filter.dataset.status;
        renderVistorias();
    });
});

vistoriaList.addEventListener('click', e => {
    const target = e.target.closest('.view-details-btn');
    if (target) {
        currentVistoriaId = target.dataset.id;
        showDetailsPage();
    }
});

backToDashboardBtn.addEventListener('click', () => showDashboard(auth.currentUser.email));

// Eventos do Modal
openModalBtn.addEventListener('click', () => newVistoriaModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => newVistoriaModal.classList.add('hidden'));

newVistoriaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(newVistoriaForm);
    const codigoVistoria = formData.get('codigoVistoria');

    if (!codigoVistoria) {
        alert("O Código da Vistoria é obrigatório para o cadastro manual.");
        return;
    }

    const vistoriaData = {
        codigoImovel: formData.get('codigoImovel'),
        codigoVistoria: codigoVistoria,
        endereco: formData.get('endereco'),
        locatario: formData.get('locatario'),
        dataAgendamento: formData.get('dataAgendamento'),
        tipo: formData.get('tipo'),
        status: formData.get('status'),
        history: [{
            date: new Date().toISOString().split('T')[0],
            event: 'Cadastro manual realizado.'
        }]
    };

    try {
        const docRef = doc(db, "vistorias", codigoVistoria);
        await setDoc(docRef, vistoriaData, { merge: true });

        newVistoriaForm.reset();
        newVistoriaModal.classList.add('hidden');
        fetchAndRenderVistorias();
        alert('Vistoria salva com sucesso!');
    } catch (error) {
        console.error("Erro ao adicionar vistoria: ", error);
        alert("Erro ao salvar a vistoria.");
    }
});
