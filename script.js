// --- NAVEGACIÓN ENTRE VISTAS ---
function showView(viewId) {
    document.querySelectorAll('.view-container, #section2-app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    window.scrollTo(0,0);
}

function goToSection2(e) {
    e.preventDefault();
    
    // Capturar datos de Sección 1
    const form1 = document.getElementById('form-section1');
    const formData1 = new FormData(form1);
    
    // --- CORRECCIÓN INTEGRADA: Capturar lista de semestres y campos nuevos ---
    const semestresSeleccionados = formData1.getAll('semestre');

    window.surveyData.personal = {
        nombre: formData1.get('nombre') || '',
        // Se busca 'Apellidos' (como en tu HTML) o 'apellidos' por seguridad
        apellidos: formData1.get('Apellidos') || formData1.get('apellidos') || '',
        CI: formData1.get('CI') || '',
        registro: formData1.get('registro') || '',
        celular: formData1.get('celular') || '',
        correo: formData1.get('correo') || '',
        
        // Aquí guardamos el ARRAY con todos los semestres marcados
        semestre: semestresSeleccionados,
        
        carga_academica: formData1.get('carga_academica') || '',
        trabaja: formData1.get('trabaja') || '',
        
        // Campos que faltaban y que impedían que se guardaran en Firebase
        horas_estudio: formData1.get('horas_estudio') || '',
        avance: formData1.get('avance') || ''
    };
    
    console.log("Datos Personales Capturados Correctamente:", window.surveyData.personal);
    // -----------------------------------------------------------------------
    
    showView('section2-app-view');
}

function goToSection2Q10() {
    // Capturar estado actual de la malla
    const mallaCards = document.querySelectorAll('.materia-card');
    window.surveyData.malla = Array.from(mallaCards).map(card => ({
        id: card.id,
        nombre: card.innerText,
        estado: card.dataset.status
    }));
    
    showView('section2-q10-view');
}

function goToSection3(e) {
    e.preventDefault();
    
    // Capturar datos de Sección 2 (Q10)
    const form10 = document.getElementById('form-q10');
    const formData10 = new FormData(form10);
    window.surveyData.seccion2_cierre.q10 = formData10.get('q10') || '';
    
    // Si eligió "Depende", capturar explicación
    const q10Text = document.getElementById('q10-text');
    if (q10Text && !q10Text.disabled) {
        window.surveyData.seccion2_cierre.explicacion = q10Text.value || '';
    }
    
    showView('section3-view');
}

function goToSection4(e) {
    e.preventDefault();
    
    // Capturar datos de Sección 3 (Expectativas)
    window.surveyData.seccion3.q11 = document.querySelector('input[name="q11"]:checked')?.value || '';
    
    const q12Option = document.querySelector('input[name="q12"]:checked')?.value;
    window.surveyData.seccion3.q12 = q12Option || '';
    
    // Si eligió "Otra", capturar el texto
    if (q12Option === 'Otra' || q12Option === 'otra') {
        const q12Text = document.getElementById('q12-text');
        window.surveyData.seccion3.q12_otra = q12Text?.value || '';
    }
    
    showView('section4-view');
}

function goToSection5(e) {
    e.preventDefault();
    
    // Capturar datos de Sección 4 (Medidas)
    const q13Selected = Array.from(document.querySelectorAll('.q13-check:checked')).map(c => c.value);
    window.surveyData.seccion4.q13 = q13Selected;
    
    // Si eligió "Otros", capturar el texto
    const checkOtros = document.getElementById('q13-otros');
    if (checkOtros && checkOtros.checked) {
        const q13Text = document.getElementById('q13-text');
        window.surveyData.seccion4.q13_otros = q13Text?.value || '';
    }
    
    // Capturar Q14 (prioridad)
    window.surveyData.seccion4.prioridad = document.querySelector('input[name="q14"]:checked')?.value || '';
    
    showView('section5-view');
}

function submitFinal(e) {
    e.preventDefault();
    
    // Capturar datos de Sección 5
    const form5 = document.getElementById('form-section5');
    const formData5 = new FormData(form5);
    window.surveyData.seccion5.propuesta = formData5.get('propuesta') || '';
    
    // Mostrar vista de agradecimiento
    showView('thank-you-view');
    
    // Mostrar spinner y enviar a Firebase
    const spinner = document.getElementById('loading-spinner');
    const successMsg = document.getElementById('success-msg');
    if(spinner) spinner.classList.remove('hidden');
    if(successMsg) successMsg.classList.add('hidden');
    
    // Enviar datos a Firebase
    if (window.saveSurveyToFirebase) {
        window.saveSurveyToFirebase(window.surveyData)
            .then((success) => {
                if(spinner) spinner.classList.add('hidden');
                if (success) {
                    if(successMsg) successMsg.classList.remove('hidden');
                    localStorage.removeItem('mallaCurricularData'); // Limpiar datos locales
                } else {
                    alert("Hubo un problema al guardar. Por favor revisa tu conexión.");
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                if(spinner) spinner.classList.add('hidden');
                alert("Error inesperado al guardar.");
            });
    } else {
        console.error("La función saveSurveyToFirebase no está definida.");
    }
}

// --- LISTENERS PARA CAMPOS "OTRO" ---

// Q10 Text
const radiosQ10 = document.querySelectorAll('input[name="q10"]');
radiosQ10.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const textInput = document.getElementById('q10-text');
        if(!textInput) return;
        if (e.target.value === 'Depende') {
            textInput.disabled = false;
            textInput.focus();
        } else {
            textInput.disabled = true;
            textInput.value = '';
        }
    });
});

// Q12 Text
const radiosQ12 = document.querySelectorAll('input[name="q12"]');
radiosQ12.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const textInput = document.getElementById('q12-text');
        if(!textInput) return;
        if (e.target.value === 'Otra' || e.target.value === 'otra') {
            textInput.disabled = false;
            textInput.focus();
        } else {
            textInput.disabled = true;
            textInput.value = '';
        }
    });
});

// Q13 & Q14 Logic
const q13Checkboxes = document.querySelectorAll('.q13-check');
const q13OtherInput = document.getElementById('q13-text');
const q13OtherCheck = document.getElementById('q13-otros');

if(q13OtherCheck && q13OtherInput) {
    q13OtherCheck.addEventListener('change', (e) => {
        q13OtherInput.disabled = !e.target.checked;
        if(!e.target.checked) q13OtherInput.value = '';
        updateQ14Options();
    });
    q13OtherInput.addEventListener('input', updateQ14Options);
}

if(q13Checkboxes.length > 0) {
    q13Checkboxes.forEach(chk => {
        chk.addEventListener('change', updateQ14Options);
    });
}

function updateQ14Options() {
    const container = document.getElementById('q14-options');
    if(!container) return;
    container.innerHTML = '';
    
    let hasSelection = false;

    const currentChecks = document.querySelectorAll('.q13-check');
    currentChecks.forEach(chk => {
        if (chk.checked) {
            hasSelection = true;
            let labelText = chk.parentElement.textContent.trim();
            let value = chk.value;

            // Si es "Otros", tomamos el valor del input
            if (chk.id === 'q13-otros') {
                const typedText = q13OtherInput.value.trim();
                if (typedText) {
                    labelText = typedText; 
                    value = "Otro: " + typedText;
                } else {
                    labelText = "Otra opción (Especifique arriba)";
                }
            } else {
                labelText = value; 
            }

            const wrapper = document.createElement('label');
            wrapper.className = "flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer animate-fade-in";
            wrapper.innerHTML = `
                <input type="radio" name="q14" value="${value}" required class="accent-blue-900">
                <span class="text-sm">${labelText}</span>
            `;
            container.appendChild(wrapper);
        }
    });

    if (!hasSelection) {
        container.innerHTML = '<p class="text-slate-400 italic text-sm">Selecciona opciones en la pregunta 15 primero.</p>';
    }
}

// --- LÓGICA APP MALLA (Mantenida intacta) ---
const semesterData = [
    { id: "s1", title: "1er Semestre", subjects: ["Filosofía", "Estadística I", "Sociología I", "Antropología Cultural", "Psicología I", "Biopsicología", "Estrategias de Aprendizaje"] },
    { id: "s2", title: "2do Semestre", subjects: ["Epistemología", "Estadística II", "Sociología II", "Antropología Cultural Boliviana", "Psicología II", "Psicofisiología"] },
    { id: "s3", title: "3er Semestre", subjects: ["Investigación I", "Psicología Social", "Psicología Etnoecológica", "Desarrollo Humano I", "Teorías y Sistemas I", "Neuropsicología I", "Aprendizaje"] },
    { id: "s4", title: "4to Semestre", subjects: ["Investigación II", "Psicología Grupal y Organizacional", "Desarrollo Humano II", "Teorías y Sistemas II", "Neuropsicología II", "Etología"] },
    { id: "s5", title: "5to Semestre", subjects: ["Investigación III", "Comportamiento y Sociedad", "Psicología de la Personalidad I", "Evaluación Psicológica I", "Psicopatología I", "Psicología Cognitiva I"] },
    { id: "s6", title: "6to Semestre", subjects: ["Investigación IV", "Diagnóstico de Necesidades", "Psicología de la Personalidad II", "Evaluación Psicológica II", "Psicopatología II", "Psicoanálisis", "Psicología Cognitiva II"] },
    { id: "s7", title: "7mo Semestre", subjects: ["Investigación V", "Proyectos I", "Tec. de Int. Socio - Organizacional I", "Técnicas Proyectivas", "Tec. de Int. Clínica I", "Tec. de Int. Educativa I"] },
    { id: "s8", title: "8vo Semestre", subjects: ["Investigación VI", "Proyectos II", "Tec. de Int. Socio - Organizacional II", "Psicodiagnóstico", "Tec. de Int. Clínica II", "Tec. de Int. Educativa II"] },
    { id: "s9", title: "9no Semestre", subjects: ["Ética Profesional I"] },
    { id: "s10", title: "10mo Semestre", subjects: ["Ética Profesional II"] }
];

const abordajesData = {
    humanista: { label: "MOD Humanista", sem9: [{ name: "Abordaje Clínico I", req: "Tec. de Int. Clínica II" }, { name: "Abordaje Educativo I", req: "Tec. de Int. Educativa II" }, { name: "Abordaje Socio Organizacional I", req: "Tec. de Int. Socio - Organizacional II" }], sem10: [{ name: "Abordaje Clínico II", req: null }, { name: "Abordaje Educativo II", req: null }, { name: "Abordaje Socio Organizacional II", req: null }] },
    cognitivo: { label: "MOD Cognitivo Cond.", sem9: [{ name: "Abordaje Clínico I", req: null }, { name: "Abordaje Educativo I", req: null }, { name: "Abordaje Socio Organizacional I", req: null }], sem10: [{ name: "Abordaje Clínico II", req: null }, { name: "Abordaje Educativo II", req: null }, { name: "Abordaje Socio Organizacional II", req: null }] },
    ambiental: { label: "MOD Amb. Comunitario", sem9: [{ name: "Psicología Ambiental I", req: null }, { name: "Psicología Comunitaria I", req: null }, { name: "Psicología de las Organizaciones I", req: null }], sem10: [{ name: "Psicología Ambiental II", req: null }, { name: "Psicología Comunitaria II", req: null }, { name: "Psicología de las Organizaciones II", req: null }] },
    psicoanalitico: { label: "MOD Psicoanalítico", sem9: [{ name: "Abordaje Clínico I", req: null }, { name: "Abordaje Educativo I", req: null }, { name: "Abordaje Socio Organizacional I", req: null }], sem10: [{ name: "Abordaje Clínico II", req: null }, { name: "Abordaje Educativo II", req: null }, { name: "Abordaje Socio Organizacional II", req: null }] }
};

const electivasData = ["Electiva I", "Electiva II", "Electiva III", "Electiva IV"];
const talleresData = ["Taller I", "Taller II", "Taller III", "Taller IV"];

let currentTool = 'aprobado';
let currentModality = 'humanista';
let editingId = null;

const styles = {
    pendiente: 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md hover:text-blue-900',
    aprobado: 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:border-emerald-500 shadow-sm font-bold',
    reprobado: 'bg-rose-50 border-rose-300 text-rose-700 hover:border-rose-400 shadow-sm',
    levantamiento: 'bg-sky-50 border-sky-300 text-sky-700 hover:border-sky-400 shadow-sm'
};
const icons = { aprobado: '<i class="fas fa-check text-[10px] absolute top-1 right-1 opacity-50"></i>', reprobado: '<i class="fas fa-times text-[10px] absolute top-1 right-1 opacity-50"></i>', levantamiento: '<i class="fas fa-arrow-up text-[10px] absolute top-1 right-1 opacity-50"></i>', pendiente: '' };

function init() {
    renderSemesters();
    renderBottomRows();
    updateProgress();
    setTool('aprobado');
    // Inicializar vista 1
    showView('section1-view');
    
    // Inicializar Drag to Scroll
    const slider = document.getElementById('malla-container');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('cursor-grabbing');
            slider.classList.remove('cursor-grab');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('cursor-grabbing');
            slider.classList.add('cursor-grab');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('cursor-grabbing');
            slider.classList.add('cursor-grab');
        });
        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    }
}

// --- SISTEMA DE GUARDADO (LOCALSTORAGE) ---
function saveData() {
    const state = {};
    const names = {};

    document.querySelectorAll('.materia-card').forEach(card => {
        // Guardar estado
        if (card.dataset.status !== 'pendiente') {
            state[card.id] = card.dataset.status;
        }
        // Guardar nombres personalizados si difieren del original
        if (card.dataset.originalName !== card.innerText) {
            names[card.id] = card.innerText;
        }
    });

    // Guardamos también la modalidad seleccionada
    const data = { state, names, modality: currentModality };
    localStorage.setItem('mallaCurricularData', JSON.stringify(data));
    
    showSaveToast();
}

function loadData() {
    const rawData = localStorage.getItem('mallaCurricularData');
    if (!rawData) return;

    try {
        const { state, names, modality } = JSON.parse(rawData);

        // Restaurar Modalidad
        if (modality && abordajesData[modality]) {
            currentModality = modality;
        }

        // Hack: Guardamos los datos cargados en variable global para aplicarlos después del render
        window.loadedState = state;
        window.loadedNames = names;

    } catch (e) {
        console.error("Error cargando datos", e);
    }
}

function applyLoadedData() {
    if (window.loadedNames) {
        Object.keys(window.loadedNames).forEach(id => {
            const card = document.getElementById(id);
            if (card) card.innerText = window.loadedNames[id];
        });
    }

    if (window.loadedState) {
        Object.keys(window.loadedState).forEach(id => {
            const card = document.getElementById(id);
            if (card) {
                const status = window.loadedState[id];
                card.dataset.status = status;
                updateCardStyle(card, status);
            }
        });
    }
}

function confirmReset() {
    document.getElementById('reset-modal').classList.remove('hidden');
    document.getElementById('reset-modal').classList.add('flex');
}

function closeResetModal() {
    document.getElementById('reset-modal').classList.add('hidden');
    document.getElementById('reset-modal').classList.remove('flex');
}

function closeSurveyCompletedModal() {
    document.getElementById('survey-completed-modal').classList.add('hidden');
    document.getElementById('survey-completed-modal').classList.remove('flex');
    if(inputRegistro) {
        inputRegistro.value = '';
        inputRegistro.focus();
    }
}

function showSurveyCompletedModal(registro, nombre = '', apellido = '') {
    const modal = document.getElementById('survey-completed-modal');
    const registroSpan = document.getElementById('modal-registro');
    const nombreSpan = document.getElementById('modal-nombre');
    const apellidoSpan = document.getElementById('modal-apellido');
    
    registroSpan.textContent = registro;
    nombreSpan.textContent = nombre || 'No disponible';
    apellidoSpan.textContent = apellido || 'No disponible';
    
    // Guardar datos en variables globales para el PDF
    window.datosModalRegistro = registro;
    window.datosModalNombre = nombre;
    window.datosModalApellido = apellido;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function descargarReportePDF() {
    try {
        console.log('📥 Iniciando descarga de reporte PDF...');
        
        const registro = window.datosModalRegistro;
        if (!registro) {
            alert('Error: No se encontró el registro');
            return;
        }
        
        // Obtener datos de Firebase
        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        const q = query(
            collection(window.db, 'encuestas_estudiantes'),
            where('personal.registro', '==', registro)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            alert('No se encontraron datos de la encuesta');
            return;
        }
        
        const data = querySnapshot.docs[0].data();
        
        // Crear PDF con jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        let yPos = 15;
        
        // === ENCABEZADO ===
        // Fondo azul oscuro
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Título principal
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('REPORTE DE ENCUESTA', 20, 15);
        doc.text('Carrera de Psicología - UAGRM', 20, 23);
        
        // Línea divisora
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(1);
        doc.line(0, 35, pageWidth, 35);
        
        // === DATOS PERSONALES ===
        yPos = 45;
        doc.setTextColor(31, 41, 55);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('📋 DATOS PERSONALES', 15, yPos);
        
        // Caja de datos personales
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos + 3, 180, 50, 'FD');
        
        yPos += 8;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        
        const datosPersonales = data.personal || {};
        const datosArray = [
            { label: 'Registro:', valor: datosPersonales.registro },
            { label: 'Nombre:', valor: datosPersonales.nombre },
            { label: 'Apellidos:', valor: datosPersonales.Apellidos || datosPersonales.apellidos },
            { label: 'CI:', valor: datosPersonales.CI },
            { label: 'Celular:', valor: datosPersonales.celular },
            { label: 'Correo:', valor: datosPersonales.correo },
            { label: 'Semestre(s):', valor: Array.isArray(datosPersonales.semestre) ? datosPersonales.semestre.join(', ') : datosPersonales.semestre },
            { label: 'Carga Académica:', valor: datosPersonales.carga_academica + ' materias' },
            { label: '¿Trabaja?:', valor: datosPersonales.trabaja },
            { label: 'Horas de Estudio:', valor: datosPersonales.horas_estudio + ' horas' },
            { label: 'Avance Académico:', valor: datosPersonales.avance }
        ];
        
        let col1 = 0;
        datosArray.forEach((campo, idx) => {
            if (campo.valor) {
                if (col1 === 0) {
                    yPos += 6;
                }
                doc.setFont('Helvetica', 'bold');
                doc.setTextColor(59, 130, 246);
                doc.setFontSize(9);
                doc.text(campo.label, 20, yPos);
                doc.setFont('Helvetica', 'normal');
                doc.setTextColor(31, 41, 55);
                doc.text(String(campo.valor), 50, yPos);
                col1++;
                if (col1 === 2) {
                    col1 = 0;
                }
            }
        });
        
        yPos += 15;
        
        // === SECCIÓN 2: MALLA CURRICULAR ===
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('📚 SECCIÓN 2: MALLA CURRICULAR - AVANCE ACADÉMICO', 15, yPos);
        
        yPos += 8;
        
        // Leyenda de colores
        const colorLegend = [
            { color: [16, 185, 129], label: 'Aprobado' },
            { color: [239, 68, 68], label: 'Reprobado' },
            { color: [59, 130, 246], label: 'Levantamiento' },
            { color: [156, 163, 175], label: 'Pendiente' }
        ];
        
        let xLegend = 15;
        colorLegend.forEach(item => {
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.rect(xLegend, yPos, 4, 4, 'F');
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(31, 41, 55);
            doc.text(item.label, xLegend + 6, yPos + 3);
            xLegend += 50;
        });
        
        yPos += 8;
        
        // Crear mapa de materias por semestre e id
        const mallaMap = {};
        const semesterNames = {};
        
        if (data.malla && Array.isArray(data.malla)) {
            data.malla.forEach(m => {
                mallaMap[m.id] = m.estado;
            });
        }
        
        // Datos de semestres (del mismo código de la app)
        const semesters = [
            { id: "s1", title: "1er Semestre", subjects: ["Filosofía", "Estadística I", "Sociología I", "Antropología Cultural", "Psicología I", "Biopsicología", "Estrategias de Aprendizaje"] },
            { id: "s2", title: "2do Semestre", subjects: ["Epistemología", "Estadística II", "Sociología II", "Antropología Cultural Boliviana", "Psicología II", "Psicofisiología"] },
            { id: "s3", title: "3er Semestre", subjects: ["Investigación I", "Psicología Social", "Psicología Etnoecológica", "Desarrollo Humano I", "Teorías y Sistemas I", "Neuropsicología I", "Aprendizaje"] },
            { id: "s4", title: "4to Semestre", subjects: ["Investigación II", "Psicología Grupal y Organizacional", "Desarrollo Humano II", "Teorías y Sistemas II", "Neuropsicología II", "Etología"] },
            { id: "s5", title: "5to Semestre", subjects: ["Investigación III", "Comportamiento y Sociedad", "Psicología de la Personalidad I", "Evaluación Psicológica I", "Psicopatología I", "Psicología Cognitiva I"] },
            { id: "s6", title: "6to Semestre", subjects: ["Investigación IV", "Diagnóstico de Necesidades", "Psicología de la Personalidad II", "Evaluación Psicológica II", "Psicopatología II", "Psicoanálisis", "Psicología Cognitiva II"] },
            { id: "s7", title: "7mo Semestre", subjects: ["Investigación V", "Proyectos I", "Tec. de Int. Socio - Organizacional I", "Técnicas Proyectivas", "Tec. de Int. Clínica I", "Tec. de Int. Educativa I"] },
            { id: "s8", title: "8vo Semestre", subjects: ["Investigación VI", "Proyectos II", "Tec. de Int. Socio - Organizacional II", "Psicodiagnóstico", "Tec. de Int. Clínica II", "Tec. de Int. Educativa II"] },
            { id: "s9", title: "9no Semestre", subjects: ["Ética Profesional I"] },
            { id: "s10", title: "10mo Semestre", subjects: ["Ética Profesional II"] }
        ];
        
        const colores = {
            'aprobado': [16, 185, 129],
            'reprobado': [239, 68, 68],
            'levantamiento': [59, 130, 246],
            'pendiente': [156, 163, 175]
        };
        
        // Mostrar semestres en 2 columnas
        let semestreCols = [[], []];
        semesters.forEach((sem, idx) => {
            semestreCols[idx % 2].push(sem);
        });
        
        // Dibujar semestres en columnas
        let col = 0;
        semesters.forEach((sem, semIndex) => {
            const isNewRow = semIndex > 0 && semIndex % 2 === 0;
            
            if (isNewRow && yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 15;
            }
            
            if (semIndex % 2 === 0) {
                yPos += 1;
            }
            
            const xCol = semIndex % 2 === 0 ? 15 : 105;
            const colWidth = 85;
            
            // Encabezado del semestre
            doc.setFillColor(31, 41, 55);
            doc.rect(xCol, yPos, colWidth, 5, 'F');
            
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(sem.title, xCol + 2, yPos + 3);
            
            let ySubject = yPos + 5;
            
            // Materias del semestre
            sem.subjects.forEach((subject, idx) => {
                const id = `${sem.id}-${idx}`;
                const estado = mallaMap[id] || 'pendiente';
                const color = colores[estado];
                
                // Fondo de la materia según estado
                doc.setFillColor(color[0], color[1], color[2]);
                doc.rect(xCol, ySubject, colWidth, 3.5, 'F');
                
                // Texto de la materia
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(255, 255, 255);
                
                const textLines = doc.splitTextToSize(subject, colWidth - 2);
                doc.text(textLines[0] || subject, xCol + 1, ySubject + 2.5);
                
                ySubject += 3.5;
            });
            
            if (semIndex % 2 === 1) {
                yPos = ySubject + 1;
            }
        });
        
        yPos = yPos + 3;
        
        // === RESUMEN DE ESTADÍSTICAS ===
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text('📊 RESUMEN DE PROGRESO', 15, yPos);
        
        yPos += 8;
        
        // Contar materias por estado
        const estadisticas = {
            'aprobado': 0,
            'reprobado': 0,
            'levantamiento': 0,
            'pendiente': 0
        };
        
        if (data.malla && Array.isArray(data.malla)) {
            data.malla.forEach(m => {
                if (estadisticas[m.estado] !== undefined) {
                    estadisticas[m.estado]++;
                }
            });
        }
        
        const total = Object.values(estadisticas).reduce((a, b) => a + b, 0);
        const porcentajeAprobado = total > 0 ? Math.round((estadisticas.aprobado / total) * 100) : 0;
        
        // Mostrar barras de progreso
        const estadosResumen = [
            { label: 'Aprobado', valor: estadisticas.aprobado, color: [16, 185, 129] },
            { label: 'Pendiente', valor: estadisticas.pendiente, color: [156, 163, 175] },
            { label: 'Reprobado', valor: estadisticas.reprobado, color: [239, 68, 68] },
            { label: 'Levantamiento', valor: estadisticas.levantamiento, color: [59, 130, 246] }
        ];
        
        estadosResumen.forEach(item => {
            // Etiqueta y número
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(31, 41, 55);
            doc.text(item.label + ':', 15, yPos);
            doc.text(String(item.valor), 70, yPos);
            
            // Barra de progreso
            const barraAncho = 100 * (item.valor / Math.max(total, 1));
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.rect(80, yPos - 1.5, barraAncho, 3, 'F');
            
            // Borde de la barra
            doc.setDrawColor(200, 200, 200);
            doc.rect(80, yPos - 1.5, 100, 3);
            
            yPos += 6;
        });
        
        yPos += 2;
        
        // Porcentaje total de aprobado
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setFillColor(16, 185, 129);
        doc.rect(15, yPos, 180, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.text(`✓ Avance Total: ${porcentajeAprobado}% Aprobado (${estadisticas.aprobado}/${total} materias)`, 20, yPos + 6.5);
        
        yPos += 15;
        
        // === PREGUNTA DE CIERRE (Q10) ===
        if (yPos > pageHeight - 35) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text('¿Cómo afecta esto tu avance curricular?', 15, yPos);
        
        yPos += 5;
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos, 180, 12, 'FD');
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        const respuesta = doc.splitTextToSize(data.seccion2_cierre?.q10 || 'No respondida', 170);
        doc.text(respuesta, 20, yPos + 3);
        
        yPos += 15;
        
        if (data.seccion2_cierre?.q10_text) {
            doc.setFont('Helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            const textoExpl = doc.splitTextToSize('Explicación: ' + data.seccion2_cierre.q10_text, 170);
            doc.text(textoExpl, 20, yPos);
            yPos += textoExpl.length * 4 + 2;
        }
        
        yPos += 5;
        
        // === SECCIÓN 3: EXPECTATIVAS ===
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('🎯 SECCIÓN 3: EXPECTATIVAS', 15, yPos);
        
        yPos += 7;
        
        // Caja de expectativas
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos, 180, 25, 'FD');
        
        yPos += 5;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('¿Cómo te sientes respecto a la implementación del nuevo currículo?', 20, yPos);
        
        yPos += 5;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        const resp11 = doc.splitTextToSize(data.seccion3?.q11 || 'No respondida', 160);
        doc.text(resp11, 20, yPos);
        yPos += resp11.length * 4 + 2;
        
        yPos += 3;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('¿Qué crees que aportará el nuevo currículo?', 20, yPos);
        
        yPos += 4;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        const resp12 = doc.splitTextToSize(data.seccion3?.q12 || 'No respondida', 160);
        doc.text(resp12, 20, yPos);
        yPos += resp12.length * 4;
        
        yPos += 8;
        
        // === SECCIÓN 4: MEDIDAS PREFERIDAS ===
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('⚙️ SECCIÓN 4: MEDIDAS DE TRANSICIÓN', 15, yPos);
        
        yPos += 8;
        
        // Caja de medidas
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        
        let medidasText = 'Ninguna seleccionada';
        if (data.seccion4?.q13 && Array.isArray(data.seccion4.q13) && data.seccion4.q13.length > 0) {
            medidasText = data.seccion4.q13.join(', ');
        }
        
        const lineasMedidas = doc.splitTextToSize('✓ ' + medidasText, 170);
        const alturaMedidas = lineasMedidas.length * 4 + 4;
        
        doc.rect(15, yPos, 180, alturaMedidas, 'FD');
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(lineasMedidas, 20, yPos + 3);
        
        yPos += alturaMedidas + 5;
        
        // Prioridad absoluta
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(239, 68, 68);
        doc.rect(15, yPos, 180, 7, 'F');
        doc.text('⭐ PRIORIDAD ABSOLUTA: ' + (data.seccion4?.prioridad || 'No especificada'), 20, yPos + 4.5);
        
        yPos += 12;
        
        // === SECCIÓN 5: PROPUESTA ===
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 15;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('💡 SECCIÓN 5: PROPUESTA PARA MEJORAR', 15, yPos);
        
        yPos += 8;
        
        // Caja de propuesta
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.setFillColor(220, 240, 255);
        
        const propuesta = data.seccion5?.propuesta || 'No respondida';
        const lineasPropuesta = doc.splitTextToSize(propuesta, 170);
        const alturaPropuesta = lineasPropuesta.length * 4 + 8;
        
        doc.rect(15, yPos, 180, alturaPropuesta, 'FD');
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(lineasPropuesta, 20, yPos + 4);
        
        yPos += alturaPropuesta + 8;
        
        // === PIE DE PÁGINA ===
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Reporte generado: ${new Date().toLocaleString('es-ES')}`, 15, pageHeight - 8);
        
        // Línea divisora al pie
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);
        
        // Descargar PDF
        const nombreArchivo = `Reporte_${datosPersonales.nombre}_${datosPersonales.Apellidos || datosPersonales.apellidos}_${registro}.pdf`;
        doc.save(nombreArchivo);
        
        console.log('✅ PDF descargado correctamente');
        
    } catch (err) {
        console.error('❌ Error al generar PDF:', err);
        alert('Error al generar el reporte. Intenta nuevamente.');
    }
}

function performReset() {
    localStorage.removeItem('mallaCurricularData');
    localStorage.removeItem('surveyCompleted'); // También resetear encuesta
    location.reload();
}

function showSaveToast() {
    const toast = document.getElementById('save-toast');
    if(toast) {
        toast.classList.remove('opacity-0');
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            toast.classList.add('opacity-0');
        }, 2000);
    }
}

// --- FUNCIONES DE MODALIDAD ---
function changeModality(selectElement) {
    currentModality = selectElement.value;
    renderSemesters(); // Re-renderizar para mostrar las nuevas materias
    // Aplicar estados guardados a las nuevas tarjetas generadas
    applyLoadedData();
    saveData();
    updateProgress();
}

// --- VALIDACIÓN DE PRERREQUISITOS ---
function checkPrerequisites(reqName) {
    if (!reqName) return true;
    
    // Buscar la tarjeta del prerrequisito en el DOM
    const allCards = Array.from(document.querySelectorAll('.materia-card'));
    const reqCard = allCards.find(c => c.dataset.originalName === reqName);
    
    if (reqCard && reqCard.dataset.status === 'aprobado') {
        return true;
    }
    return false;
}

// --- RENDERIZADO ---
function renderSemesters() {
    const container = document.getElementById('semesters-container');
    container.innerHTML = '';

    semesterData.forEach((sem, colIndex) => {
        const col = document.createElement('div');
        col.className = "flex flex-col gap-3 w-36 flex-shrink-0 group/col";
        
        // Header Semestre
        let headerContent = sem.title;
        
        // Si es el 9no semestre (índice 8), añadir selector
        if (colIndex === 8) {
            headerContent = `
                <div class="mb-1">${sem.title}</div>
                <select onchange="changeModality(this)" class="w-full text-[10px] p-1 border rounded bg-slate-50 text-slate-600 focus:outline-none focus:border-blue-900 cursor-pointer">
                    ${Object.keys(abordajesData).map(key => 
                        `<option value="${key}" ${key === currentModality ? 'selected' : ''}>${abordajesData[key].label}</option>`
                    ).join('')}
                </select>
            `;
        }
        
        // Si es el 10mo semestre (índice 9), mostrar título indicando modalidad
        if (colIndex === 9) {
                headerContent = `
                <div class="mb-1">${sem.title}</div>
                <div class="text-[10px] text-red-700 font-normal normal-case opacity-80">(Cont. Modalidad)</div>
            `;
        }

        col.innerHTML = `
            <div class="text-center py-2 font-bold text-slate-400 text-xs uppercase tracking-wider border-b-2 border-slate-100 group-hover/col:border-blue-200 transition-colors mb-1">
                ${headerContent}
            </div>
        `;

        // Renderizar materias comunes del semestre
        sem.subjects.forEach((subj, rowIndex) => {
            const id = `sem-${colIndex}-${rowIndex}`;
            col.appendChild(createCard(id, subj));
        });

        // Renderizar Materias Dinámicas (9no y 10mo)
        const abordaje = abordajesData[currentModality];
        
        // 9no Semestre
        if (colIndex === 8) {
            abordaje.sem9.forEach((subj, i) => {
                const id = `mod9-${currentModality}-${i}`;
                const card = createCard(id, subj.name);
                
                // Chequeo de prerrequisitos (Solo visual para Humanista 9no)
                if (currentModality === 'humanista' && subj.req) {
                    card.dataset.reqName = subj.req; 
                }
                col.appendChild(card);
            });
        }
        
        // 10mo Semestre
        if (colIndex === 9) {
            abordaje.sem10.forEach((subj, i) => {
                const id = `mod10-${currentModality}-${i}`;
                const card = createCard(id, subj.name);
                col.appendChild(card);
            });
        }

        container.appendChild(col);
    });
    
    // Aplicar datos guardados después de crear todas las tarjetas
    applyLoadedData();
    
    // Verificar requisitos después de aplicar estados
    updatePrerequisiteWarnings();
}

function updatePrerequisiteWarnings() {
    document.querySelectorAll('.materia-card[data-req-name]').forEach(card => {
        const reqName = card.dataset.reqName;
        const isMet = checkPrerequisites(reqName);
        
        // Eliminar advertencias previas
        const existingWarning = card.querySelector('.req-warning');
        if (existingWarning) existingWarning.remove();

        if (!isMet && card.dataset.status !== 'aprobado') {
            const warning = document.createElement('div');
            warning.className = 'req-warning absolute -top-1 -left-1 text-amber-500 bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm text-[10px] z-10';
            warning.innerHTML = '<i class="fas fa-exclamation"></i>';
            warning.title = `Requiere: ${reqName}`;
            card.appendChild(warning);
        }
    });
}

function renderBottomRows() {
    const electivasContainer = document.getElementById('electivas-row');
    const talleresContainer = document.getElementById('talleres-row');

    electivasContainer.innerHTML = '';
    talleresContainer.innerHTML = '';

    electivasData.forEach((subj, i) => {
        const id = `elec-${i}`;
        electivasContainer.appendChild(createCard(id, subj));
    });

    talleresData.forEach((subj, i) => {
        const id = `taller-${i}`;
        talleresContainer.appendChild(createCard(id, subj));
    });
}

function createCard(id, text) {
    const card = document.createElement('div');
    // Clases base
    card.className = `materia-card cursor-pointer p-2 rounded-lg border text-xs h-20 flex items-center justify-center text-center select-none w-36 relative ${styles.pendiente}`;
    card.id = id;
    card.innerText = text;
    
    // Guardamos el nombre original para comparar al guardar
    card.dataset.originalName = text; 
    card.dataset.status = 'pendiente';
    
    card.onclick = () => applyTool(card);
    card.ondblclick = () => openEditModal(card);
    
    return card;
}

// --- INTERACCIÓN Y LÓGICA ---
function setTool(tool) {
    currentTool = tool;
    
    // UI de los botones
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'shadow-sm', 'ring-1', 'ring-slate-200', 'opacity-100');
        btn.classList.add('opacity-60', 'grayscale-[0.5]');
    });
    
    const active = document.getElementById(`btn-${tool}`);
    if(active) {
        active.classList.remove('opacity-60', 'grayscale-[0.5]');
        // Azul Oscuro para la herramienta activa
        active.classList.add('bg-white', 'shadow-sm', 'ring-1', 'ring-slate-200', 'opacity-100', 'text-blue-900');
    }
}

function applyTool(card) {
    // Alternar estado si es la misma herramienta (opcional, aquí solo aplicamos)
    const newStatus = currentTool;
    card.dataset.status = newStatus;
    
    updateCardStyle(card, newStatus);
    
    // Si cambiamos el estado de una materia del 8vo, podría afectar los requisitos del 9no
    updatePrerequisiteWarnings();
    
    updateProgress();
    saveData(); // Guardar cambios
}

function updateCardStyle(card, status) {
    // Limpiar clases antiguas
    card.className = `materia-card cursor-pointer p-2 rounded-lg border text-xs h-20 flex items-center justify-center text-center select-none w-36 relative transition-colors duration-300`;
    
    // Aplicar nuevas clases
    const styleClasses = styles[status].split(' ');
    card.classList.add(...styleClasses);

    // Manejo de iconos (eliminar e insertar)
    // Primero quitamos iconos de estado
    const oldIcons = card.querySelectorAll('i:not(.fa-exclamation)'); // No borrar advertencias
    oldIcons.forEach(i => i.remove());
    
    if(icons[status]) {
        card.insertAdjacentHTML('beforeend', icons[status]);
    }
}

function updateProgress() {
    const allCards = document.querySelectorAll('.materia-card');
    const approved = document.querySelectorAll('.materia-card[data-status="aprobado"]');
    
    const pct = allCards.length ? Math.round((approved.length / allCards.length) * 100) : 0;
    
    // Contador numérico
    const counter = document.getElementById('progress-text');
    if (counter) {
        // Animación simple de número
        animateValue(counter, parseInt(counter.innerText), pct, 500);
    }

    // Barra visual
    const bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.width = `${pct}%`;
        
        // Cambio de color de la barra según avance (SE MANTIENE SEMÁFORO ESTÁNDAR)
        if (pct < 30) bar.className = 'h-full bg-red-600 w-0 rounded-full transition-all duration-500';
        else if (pct < 70) bar.className = 'h-full bg-yellow-500 w-0 rounded-full transition-all duration-500';
        else bar.className = 'h-full bg-green-600 w-0 rounded-full transition-all duration-500';
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- MODAL DE EDICIÓN ---
function openEditModal(card) {
    editingId = card.id;
    const input = document.getElementById('edit-input');
    input.value = card.innerText;
    
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Animación de entrada
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
        input.focus();
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        editingId = null;
    }, 300);
}

function saveEdit() {
    if (editingId) {
        const val = document.getElementById('edit-input').value.trim();
        if (val) {
            const card = document.getElementById(editingId);
            // Solo actualiza el texto, mantenemos el icono si existe
            // Preservar hijos (iconos de estado y advertencias)
            const children = Array.from(card.children);
            card.innerText = val;
            children.forEach(child => card.appendChild(child));
            
            saveData(); // Guardar el cambio de nombre
        }
        closeModal();
    }
}

// Listener para edit-input si existe
const editInput = document.getElementById('edit-input');
if(editInput) {
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
}

const editModal = document.getElementById('edit-modal');
if(editModal) {
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
}

// --- VALIDACIÓN DE REGISTRO UNIVERSITARIO EN TIEMPO REAL ---
const inputRegistro = document.getElementById('input-registro');
const errorDiv = document.getElementById('error-registro');
const submitBtn = document.querySelector('#form-section1 button[type="submit"]');

let timerValidacion;

if(inputRegistro) {
    // Validar mientras escribe (evento input)
    inputRegistro.addEventListener('input', function() {
        const registro = this.value.trim();
        
        clearTimeout(timerValidacion);
        
        if (registro === '') {
            errorDiv.classList.add('hidden');
            this.classList.remove('invalid');
            submitBtn.disabled = false;
            return;
        }
        
        if (!/^\d+$/.test(registro)) {
            errorDiv.classList.remove('hidden');
            this.classList.add('invalid');
            submitBtn.disabled = true;
            return;
        }
        
        // Debounce: 200ms
        timerValidacion = setTimeout(() => {
            validarRegistroEnTiempoReal(registro, this);
        }, 200);
    });

    // Validar cuando sale del campo
    inputRegistro.addEventListener('blur', function() {
        clearTimeout(timerValidacion);
        const registro = this.value.trim();
        
        if (registro !== '' && /^\d+$/.test(registro)) {
            validarRegistroEnTiempoReal(registro, this);
        }
    });

    // Limpiar estilos cuando empieza a escribir
    inputRegistro.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        }
    });
}

function validarRegistroEnTiempoReal(registro, inputElement) {
    // Si aún no se cargaron los registros, esperar
    if (!window.registrosCargados) {
        console.warn('⏳ Aún procesando registros...');
        if(errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Validando registro...</span>';
            errorDiv.classList.remove('hidden');
        }
        if(submitBtn) submitBtn.disabled = true;
        
        // Reintentar cuando estén listos
        const intentar = setInterval(() => {
            if (window.registrosCargados) {
                clearInterval(intentar);
                validarRegistroEnTiempoReal(registro, inputElement);
            }
        }, 100);
        return;
    }
    
    // Validar contra los registros cargados
    const existe = window.registrosValidos && window.registrosValidos.has(registro);
    
    console.log(`🔍 Validando: ${registro} → ${existe ? '✅ VÁLIDO' : '❌ NO VÁLIDO'}`);
    
    if (existe) {
        // Registro válido - mostrar indicador de carga
        if(errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Verificando encuestas completadas...</span>';
            errorDiv.classList.remove('hidden');
            errorDiv.style.color = '#1e40af';
        }
        
        // Ahora verificar en Firebase
        verificarEncuestaCompletada(registro).then(resultado => {
            console.log(`Firebase respuesta - Ya completada: ${resultado.encontrada}`);
            
            if (resultado.encontrada) {
                // La encuesta ya fue completada
                console.log(`⚠️ El registro ${registro} ya completó la encuesta`);
                if(errorDiv) {
                    errorDiv.innerHTML = '<i class="fas fa-check"></i> <span>Registro válido</span>';
                    errorDiv.classList.remove('hidden');
                    errorDiv.style.color = '#059669';
                }
                inputElement.style.borderColor = '#10b981';
                inputElement.style.backgroundColor = '#f0fdf4';
                if(submitBtn) submitBtn.disabled = false;
                
                // Mostrar modal después de un pequeño delay
                setTimeout(() => {
                    showSurveyCompletedModal(registro, resultado.nombre, resultado.apellido);
                }, 300);
            } else {
                // La encuesta no ha sido completada - permitir continuar
                console.log(`✅ El registro ${registro} puede completar la encuesta`);
                if(errorDiv) errorDiv.classList.add('hidden');
                inputElement.classList.remove('invalid');
                if(submitBtn) submitBtn.disabled = false;
                
                inputElement.style.borderColor = '#10b981';
                inputElement.style.backgroundColor = '#f0fdf4';
            }
        }).catch(err => {
            console.error('Error en la validación:', err);
            // Si hay error en Firebase, permitir continuar (por seguridad)
            if(errorDiv) errorDiv.classList.add('hidden');
            inputElement.classList.remove('invalid');
            if(submitBtn) submitBtn.disabled = false;
            inputElement.style.borderColor = '#10b981';
            inputElement.style.backgroundColor = '#f0fdf4';
        });
    } else {
        // Registro inválido
        console.log(`❌ Registro ${registro} no está en la base de datos válida`);
        if(errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>Usted no está registrado como estudiante de la carrera de Psicología</span>';
            errorDiv.classList.remove('hidden');
            errorDiv.style.color = '#dc2626';
        }
        inputElement.classList.add('invalid');
        if(submitBtn) submitBtn.disabled = true;
        
        inputElement.style.borderColor = '#ef4444';
        inputElement.style.backgroundColor = '#fef2f2';
    }
}

async function verificarEncuestaCompletada(registro) {
    try {
        if (!window.db) {
            console.error('❌ Firebase no está inicializado');
            return { encontrada: false, nombre: '', apellido: '' };
        }

        console.log(`🔍 Consultando Firebase por registro: ${registro}`);

        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        
        // Buscar por la ruta anidada personal.registro
        const q = query(
            collection(window.db, 'encuestas_estudiantes'),
            where('personal.registro', '==', registro)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            console.log(`✅ Encuesta encontrada para registro: ${registro}`);
            console.log(`📊 Documentos encontrados: ${querySnapshot.size}`);
            
            // Obtener datos del primer documento encontrado
            const docData = querySnapshot.docs[0].data();
            const nombre = docData?.personal?.nombre || '';
            const apellido = docData?.personal?.Apellidos || docData?.personal?.apellidos || '';
            
            console.log(`Nombre: ${nombre}, Apellido: ${apellido}`);
            
            return { encontrada: true, nombre, apellido };
        } else {
            console.log(`📝 No hay encuesta para registro: ${registro}`);
            return { encontrada: false, nombre: '', apellido: '' };
        }
    } catch (err) {
        console.error('❌ Error verificando encuesta en Firebase:', err.message);
        console.error('Detalles del error:', err);
        
        if (err.message.includes('permission-denied')) {
            console.error('⚠️ PROBLEMA: Permisos insuficientes en Firestore. Revisa las reglas de seguridad.');
        }
        
        return { encontrada: false, nombre: '', apellido: '' };
    }
}

// Validar al enviar el formulario
const formSection1 = document.getElementById('form-section1');
if(formSection1) {
    formSection1.addEventListener('submit', function(e) {
        if(inputRegistro) {
            const registro = inputRegistro.value.trim();
            
            if (!window.registrosCargados) {
                e.preventDefault();
                alert('Los registros aún se están cargando. Por favor espera unos segundos e intenta nuevamente.');
                return false;
            }
            
            const existe = window.registrosValidos && window.registrosValidos.has(registro);
            
            if (!existe) {
                e.preventDefault();
                errorDiv.classList.remove('hidden');
                inputRegistro.classList.add('invalid');
                console.error('❌ Intento de envío con registro inválido:', registro);
                return false;
            }
        }
        
        console.log('✅ Formulario válido, procediendo con envío...');
        // Llamar a goToSection2 manualmente si no es un submit nativo
        goToSection2(e);
        return true;
    });
}

// Escuchar evento de carga de registros
window.addEventListener('registrosCargados', (e) => {
    console.log(`📊 Registros listos: ${e.detail.cantidad} estudiantes cargados`);
    
    // Si el usuario ya escribió algo, validar inmediatamente
    if(inputRegistro) {
        const registro = inputRegistro.value.trim();
        if (registro && /^\d+$/.test(registro)) {
            validarRegistroEnTiempoReal(registro, inputRegistro);
        }
    }
});

// Inicializar
init();
