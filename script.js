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

    // Capturar campos "Otro" de radio buttons
    let anioIngreso = formData1.get('anio_ingreso');
    if (anioIngreso === 'Otro') {
        anioIngreso = formData1.get('anio_ingreso_otro') || 'Otro';
    }

    let modalidadIngreso = formData1.get('modalidad_ingreso');
    if (modalidadIngreso === 'Otra') {
        modalidadIngreso = formData1.get('modalidad_ingreso_otra') || 'Otra';
    }

    let tiempoTerminar = formData1.get('tiempo_terminar');
    if (tiempoTerminar === 'Otro') {
        tiempoTerminar = formData1.get('tiempo_terminar_otro') || 'Otro';
    }

    // Lógica para materias repetidas
    let repetidoMateria = formData1.get('repetido_materia');
    let materiasRepetidasNombres = '';
    if (repetidoMateria === 'Sí') {
        materiasRepetidasNombres = formData1.get('materias_repetidas_nombres') || '';
    }

    window.surveyData.personal = {
        // P1-P4
        nombre: formData1.get('nombre') || '',
        apellidos: formData1.get('Apellidos') || formData1.get('apellidos') || '',
        CI: formData1.get('CI') || '',
        registro: formData1.get('registro') || '',
        
        // P5-P7 (Nuevos)
        anio_ingreso: anioIngreso || '',
        modalidad_ingreso: modalidadIngreso || '',
        tiempo_terminar: tiempoTerminar || '',

        // P8-P9 (Antes 5-6)
        celular: formData1.get('celular') || '',
        correo: formData1.get('correo') || '',
        
        // P10 (Antes 7)
        semestre: semestresSeleccionados,
        
        // P11 (Antes 8)
        carga_academica: formData1.get('carga_academica') || '',

        // P12-P15 (Nuevos)
        materias_aprobadas: formData1.get('materias_aprobadas') || '',
        materias_reprobadas: formData1.get('materias_reprobadas') || '',
        repetido_materia: repetidoMateria || '',
        materias_repetidas_nombres: materiasRepetidasNombres,
        materias_dificultad: formData1.get('materias_dificultad') || '',

        // P16-P18 (Antes 9-11)
        trabaja: formData1.get('trabaja') || '',
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
        container.innerHTML = '<p class="text-slate-400 italic text-sm">Selecciona opciones en la pregunta 22 primero.</p>';
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
        // Registro válido
        if(errorDiv) errorDiv.classList.add('hidden');
        inputElement.classList.remove('invalid');
        if(submitBtn) submitBtn.disabled = false;
        
        inputElement.style.borderColor = '#10b981';
        inputElement.style.backgroundColor = '#f0fdf4';
    } else {
        // Registro inválido
        if(errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>Usted no está registrado como estudiante de la carrera de Psicología</span>';
            errorDiv.classList.remove('hidden');
        }
        inputElement.classList.add('invalid');
        if(submitBtn) submitBtn.disabled = true;
        
        inputElement.style.borderColor = '#ef4444';
        inputElement.style.backgroundColor = '#fef2f2';
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