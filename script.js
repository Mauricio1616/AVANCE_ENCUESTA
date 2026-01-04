// --- NAVEGACIÓN ENTRE VISTAS ---
function showView(viewId) {
    document.querySelectorAll('.view-container, #section2-app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    window.scrollTo(0, 0);
}

function goToSection2(e) {
    e.preventDefault();

    // Capturar datos de Sección 1
    const form1 = document.getElementById('form-section1');
    const formData1 = new FormData(form1);

    // --- CORRECCIÓN INTEGRADA: Capturar lista de semestres y campos nuevos ---
    const semestresSeleccionados = formData1.getAll('semestre');

    // --- VALIDACIÓN EXPLCITA CON SWEETALERT & INLINE ERRORS ---

    // Helper para mostrar error y foco
    const showError = (message, errorId, elementOrName) => {
        // 1. Mostrar Inline Error inmediatamente
        if (errorId) {
            const errEl = document.getElementById(errorId);
            if (errEl) errEl.classList.remove('hidden');
        }

        // 2. SweetAlert con callback para foco/scroll
        Swal.fire({
            icon: 'error',
            title: 'Atención',
            text: message,
            confirmButtonText: 'Entendido, ir a la pregunta',
            confirmButtonColor: '#7f1d1d',
            returnFocus: false
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                // ACCIÓN AL CERRAR/ACEPTAR:

                // A. Scroll al error inline (si existe) o al elemento
                if (errorId) {
                    const errEl = document.getElementById(errorId);
                    if (errEl) {
                        errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else if (elementOrName && typeof elementOrName !== 'string') {
                    // Fallback: Si no hay ID de error, scrollear al input
                    elementOrName.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // B. Foco y Highlight
                if (elementOrName) {
                    const clearError = () => {
                        if (errorId) {
                            const errEl = document.getElementById(errorId);
                            if (errEl) errEl.classList.add('hidden');
                        }
                        if (typeof elementOrName === 'object' && elementOrName !== null) {
                            elementOrName.classList.remove('border-red-500', 'bg-red-50');
                        }
                    };

                    if (typeof elementOrName === 'string') {
                        // Radio Group
                        const radios = document.querySelectorAll(`input[name="${elementOrName}"]`);
                        if (radios.length > 0) radios[0].focus();
                        radios.forEach(r => r.addEventListener('change', clearError, { once: true }));
                    } else {
                        // Elemento individual
                        elementOrName.classList.add('border-red-500', 'bg-red-50');
                        // focus se maneja en el scroll, aseguramos aquí también
                        elementOrName.focus();
                        elementOrName.addEventListener('input', clearError, { once: true });
                        elementOrName.addEventListener('change', clearError, { once: true });
                    }
                }
            }
        });

        return false;
    };

    const checkRequired = (value, fieldName, errorId, elementOrName) => {
        // Validar
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return showError(`El campo "${fieldName}" es obligatorio.`, errorId, elementOrName);
        }
        // Si es válido, ocultar error si existe
        if (errorId) {
            const errEl = document.getElementById(errorId);
            if (errEl) errEl.classList.add('hidden');
        }
        if (elementOrName && typeof elementOrName === 'object') {
            elementOrName.classList.remove('border-red-500', 'bg-red-50');
        }
        return true;
    };

    // 1. Datos Personales
    const inputNombre = form1.querySelector('input[name="nombre"]');
    if (!checkRequired(formData1.get('nombre'), 'Nombre', 'error-P1', inputNombre)) return;

    const inputApellidos = form1.querySelector('input[name="Apellidos"]') || form1.querySelector('input[name="apellidos"]');
    if (!checkRequired(formData1.get('Apellidos') || formData1.get('apellidos'), 'Apellidos', 'error-P2', inputApellidos)) return;

    const inputCI = form1.querySelector('input[name="CI"]');
    if (!checkRequired(formData1.get('CI'), 'Cédula de Identidad', 'error-P3', inputCI)) return;

    const inputRegistro = form1.querySelector('input[name="registro"]');
    if (!checkRequired(formData1.get('registro'), 'Registro Universitario', 'error-P4', inputRegistro)) return;

    // 2. Q5: Año (Radio + Otro)
    let anioIngreso = formData1.get('anio_ingreso');
    if (!anioIngreso) {
        return showError('Debes seleccionar un Año de ingreso.', 'error-P5', 'anio_ingreso');
    }
    if (anioIngreso === 'Otro') {
        const inputAnioOtro = form1.querySelector('input[name="anio_ingreso_otro"]');
        if (!checkRequired(formData1.get('anio_ingreso_otro'), 'Año de ingreso (Otro)', 'error-P5', inputAnioOtro)) return;
        anioIngreso = formData1.get('anio_ingreso_otro'); // GUARDAR VALOR ESCRITO
    }

    // 3. Q6: Modalidad
    let modalidadIngreso = formData1.get('modalidad_ingreso');
    if (!modalidadIngreso) {
        return showError('Debes seleccionar una Modalidad de ingreso.', 'error-P6', 'modalidad_ingreso');
    }
    if (modalidadIngreso === 'Otra' || modalidadIngreso === 'Otro') {
        const inputModOtro = form1.querySelector('input[name="modalidad_ingreso_otra"]');
        if (!checkRequired(formData1.get('modalidad_ingreso_otra'), 'Modalidad de ingreso (Otra)', 'error-P6', inputModOtro)) return;
        modalidadIngreso = formData1.get('modalidad_ingreso_otra'); // GUARDAR VALOR ESCRITO
    }

    // 4. Q7: Tiempo
    let tiempoTerminar = formData1.get('tiempo_terminar');
    if (!tiempoTerminar) {
        return showError('Debes seleccionar el Tiempo estimado para terminar.', 'error-P7', 'tiempo_terminar');
    }
    if (tiempoTerminar === 'Otro') {
        const inputTiempoOtro = form1.querySelector('input[name="tiempo_terminar_otro"]');
        if (!checkRequired(formData1.get('tiempo_terminar_otro'), 'Tiempo para terminar (Otro)', 'error-P7', inputTiempoOtro)) return;
        tiempoTerminar = formData1.get('tiempo_terminar_otro'); // GUARDAR VALOR ESCRITO
    }

    // 5. Q8-Q9
    const inputCelular = form1.querySelector('input[name="celular"]');
    if (!checkRequired(formData1.get('celular'), 'Celular', 'error-P8', inputCelular)) return;

    const inputCorreo = form1.querySelector('input[name="correo"]');
    if (!checkRequired(formData1.get('correo'), 'Correo Electrónico', 'error-P9', inputCorreo)) return;

    // 6. Q10 (Semestres)
    if (semestresSeleccionados.length === 0) {
        return showError('Por favor, selecciona en qué semestre(s) estás actualmente (Pregunta 10).', 'error-q10', null);
    } else {
        const errorQ10 = document.getElementById('error-q10');
        if (errorQ10) errorQ10.classList.add('hidden');
    }

    // 7. Q11 (PPA)
    if (!formData1.get('ppa')) {
        return showError('Debes seleccionar tu Promedio Ponderado Anual (PPA).', 'error-P11', 'ppa');
    }

    // 8. Q12 (Carga)
    const inputCarga = form1.querySelector('input[name="carga_academica"]');
    if (!checkRequired(formData1.get('carga_academica'), 'Carga Académica', 'error-P12', inputCarga)) return;

    // 9. Q13 (Aprobadas)
    const inputAprobadas = form1.querySelector('input[name="materias_aprobadas"]');
    if (!checkRequired(formData1.get('materias_aprobadas'), 'Materias Aprobadas', 'error-P13', inputAprobadas)) return;

    // 10. Q14 (Reprobadas)
    const inputReprobadas = form1.querySelector('input[name="materias_reprobadas"]');
    if (!checkRequired(formData1.get('materias_reprobadas'), 'Materias Reprobadas', 'error-P14', inputReprobadas)) return;

    // 11. Q15 (Repetido)
    let repetidoMateria = formData1.get('repetido_materia');
    let materiasRepetidasNombres = ''; // Declarar fuera del if para evitar ReferenceError

    if (!repetidoMateria) {
        return showError('Debes responder si has repetido alguna materia.', 'error-P15', 'repetido_materia');
    }
    if (repetidoMateria === 'Sí') {
        materiasRepetidasNombres = formData1.get('materias_repetidas_nombres') || '';
        if (!materiasRepetidasNombres.trim()) {
            return showError("Seleccionaste 'Sí'. Por favor busca y selecciona las materias.", 'error-q15', document.getElementById('input-q15'));
        }
    }

    // 12. Q16 (Dificultad) - OPCIONAL
    // Se eliminó la validación obligatoria por solicitud del usuario.

    // P18 (Trabaja) - Validación mejorada
    const trabajaValue = formData1.get('trabaja');
    if (!trabajaValue) {
        return showError('Complete este campo.', 'error-P18', 'trabaja');
    }

    // P19 (Horas) - Validación mejorada
    const horasValue = formData1.get('horas_estudio');
    if (!horasValue || horasValue.trim() === '') {
        return showError('Complete este campo.', 'error-P19', 'horas_estudio');
    }
    const horasNum = parseFloat(horasValue);
    if (isNaN(horasNum) || horasNum < 1 || horasNum > 24) {
        return showError('Las horas de estudio deben ser un número entre 1 y 24.', 'error-P19', 'horas_estudio');
    }

    // P20 (Avance) - Validación mejorada
    const avanceValue = formData1.get('avance');
    if (!avanceValue) {
        return showError('Complete este campo.', 'error-P20', 'avance');
    }

    // --- FIN VALIDACIÓN ---

    // Capturar lista de materias verano aprobadas y reprobadas (NUEVO P17)
    const veranoAprobadas = formData1.getAll('materias_verano_aprobadas');
    const veranoReprobadas = formData1.getAll('materias_verano_reprobadas');
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

        // P11 (NUEVO PPA)
        ppa: formData1.get('ppa') || '',

        // P12 (Antes P11)
        carga_academica: formData1.get('carga_academica') || '',

        // P13-P16 (Renumerados)
        materias_aprobadas: formData1.get('materias_aprobadas') || '',
        materias_reprobadas: formData1.get('materias_reprobadas') || '',
        repetido_materia: repetidoMateria || '',
        materias_repetidas_nombres: materiasRepetidasNombres,
        materias_dificultad: formData1.get('materias_dificultad') || '',

        // P17 (NUEVO) - Materias Verano/Nivelación
        materias_verano_aprobadas: veranoAprobadas,
        materias_verano_reprobadas: veranoReprobadas,

        // P18-P20 (Renumerados)
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

    // Validación: Verificar que al menos una materia tenga estado diferente a 'pendiente'
    const hasProgress = Array.from(mallaCards).some(card => card.dataset.status !== 'pendiente');

    if (!hasProgress) {
        alert("Por favor, marca tu avance en la malla (materias aprobadas) antes de continuar.");
        return;
    }

    window.surveyData.malla = Array.from(mallaCards).map(card => ({
        id: card.id,
        nombre: card.innerText, // This might now contain the appended text, but that's okay/good for PDF if we use this fallback
        estado: card.dataset.status,
        customSelection: card.dataset.customSelection || card.dataset.selectedWorkshop || ''
    }));

    showView('section2-q10-view');
}

function goToSection3(e) {
    e.preventDefault();

    // Capturar datos de Sección 2 (Q21/q10)
    const form10 = document.getElementById('form-q10');
    const formData10 = new FormData(form10);
    const q10Value = formData10.get('q10');

    if (!q10Value) {
        return showError('Debes responder si estas materias afectan tu avance (Pregunta 21).', 'error-q10-view', null);
    }

    window.surveyData.seccion2_cierre.q10 = q10Value;

    // Si eligió "Depende", capturar explicación y validar
    if (q10Value === 'Depende') {
        const q10Text = document.getElementById('q10-text');
        if (!q10Text || !q10Text.value.trim()) {
            return showError('Complete este campo.', 'error-q10-text', q10Text);
        }
        window.surveyData.seccion2_cierre.explicacion = q10Text.value.trim();
    } else {
        window.surveyData.seccion2_cierre.explicacion = ''; // Limpiar si cambió
    }

    showView('section3-view');
}

function goToSection4(e) {
    e.preventDefault();

    // Capturar y Validar Q22 (q11)
    const q11Value = document.querySelector('input[name="q11"]:checked')?.value;
    if (!q11Value) {
        return showError('Debes indicar cómo te sientes respecto al nuevo currículo (Pregunta 22).', 'error-q11', null);
    }
    window.surveyData.seccion3.q11 = q11Value;

    // Capturar y Validar Q23 (q12)
    const q12Option = document.querySelector('input[name="q12"]:checked')?.value;
    if (!q12Option) {
        return showError('Debes indicar qué crees que aportará el nuevo currículo (Pregunta 23).', 'error-q12', null);
    }
    window.surveyData.seccion3.q12 = q12Option;

    // Si eligió "Otra", capturar y validar texto
    if (q12Option === 'Otra' || q12Option === 'otra') {
        const q12Text = document.getElementById('q12-text');
        if (!q12Text || !q12Text.value.trim()) {
            return showError('Complete este campo.', 'error-q12-text', q12Text);
        }
        window.surveyData.seccion3.q12_otra = q12Text.value.trim();
        window.surveyData.seccion3.q12 = "Otra: " + q12Text.value.trim(); // Guardar valor combinado
    } else {
        window.surveyData.seccion3.q12_otra = '';
    }

    showView('section4-view');
}

function goToSection5(e) {
    e.preventDefault();

    // Capturar y Validar Q24 (Medidas - q13)
    const q13Checks = document.querySelectorAll('.q13-check:checked');
    if (q13Checks.length === 0) {
        return showError('Debes seleccionar al menos una medida de transición (Pregunta 24).', 'error-q13', null);
    }

    // Validar "Otros" en Q24
    const checkOtros = document.getElementById('q13-otros');
    let q13Selected = [];
    let otrosTexto = '';

    // Procesar seleccionados
    let otrosValid = true;
    q13Checks.forEach(chk => {
        if (chk.value === 'Otros') {
            const q13Text = document.getElementById('q13-text');
            if (!q13Text || !q13Text.value.trim()) {
                otrosValid = false;
                showError('Complete este campo.', 'error-q13-text', q13Text);
            } else {
                otrosTexto = q13Text.value.trim();
                q13Selected.push("Otro: " + otrosTexto); // Guardar valor con texto
            }
        } else {
            q13Selected.push(chk.value);
        }
    });

    if (!otrosValid) return; // Detener si falla la validación de texto "Otros"

    window.surveyData.seccion4.q13 = q13Selected;
    window.surveyData.seccion4.q13_otros = otrosTexto;

    // Capturar Q25 (Prioridad - q14)
    const q14Value = document.querySelector('input[name="q14"]:checked')?.value;

    // Validación de Prioridad: Debe seleccionar una si seleccionó medidas
    // (Como validamos q13 > 0, siempre debería haber opciones, salvo error lógico)
    if (!q14Value) {
        return showError('Debes elegir una prioridad absoluta de las opciones seleccionadas (Pregunta 25).', 'error-q14', null);
    }

    window.surveyData.seccion4.prioridad = q14Value;

    showView('section5-view');
}

function submitFinal(e) {
    e.preventDefault();

    // Capturar datos de Sección 5
    const form5 = document.getElementById('form-section5');
    const formData5 = new FormData(form5);
    const propuesta = formData5.get('propuesta') || '';

    if (!propuesta.trim()) {
        return showError('Por favor escribe tu propuesta para mejorar la transición (Pregunta 26).', 'error-p26', document.querySelector('textarea[name="propuesta"]'));
    }

    window.surveyData.seccion5.propuesta = propuesta;

    // Mostrar vista de agradecimiento
    showView('thank-you-view');

    // Mostrar spinner y enviar a Firebase
    const spinner = document.getElementById('loading-spinner');
    const successMsg = document.getElementById('success-msg');
    if (spinner) spinner.classList.remove('hidden');
    if (successMsg) successMsg.classList.add('hidden');

    // Enviar datos a Firebase
    if (window.saveSurveyToFirebase) {
        window.saveSurveyToFirebase(window.surveyData)
            .then((success) => {
                if (spinner) spinner.classList.add('hidden');
                if (success) {
                    if (successMsg) successMsg.classList.remove('hidden');
                    localStorage.removeItem('mallaCurricularData'); // Limpiar datos locales
                } else {
                    alert("Hubo un problema al guardar. Por favor revisa tu conexión.");
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                if (spinner) spinner.classList.add('hidden');
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
        if (!textInput) return;
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
        if (!textInput) return;
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

if (q13OtherCheck && q13OtherInput) {
    q13OtherCheck.addEventListener('change', (e) => {
        q13OtherInput.disabled = !e.target.checked;
        if (!e.target.checked) q13OtherInput.value = '';
        updateQ14Options();
    });
    q13OtherInput.addEventListener('input', updateQ14Options);
}

if (q13Checkboxes.length > 0) {
    q13Checkboxes.forEach(chk => {
        chk.addEventListener('change', updateQ14Options);
    });
}

// --- NUEVA LÓGICA: VALIDACIÓN "OTRO" (Q5, Q6, Q7) ---

function setupOtherToggle(radioName, textInputName, otherValue) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    const textInput = document.querySelector(`input[name="${textInputName}"]`);

    if (!textInput) return;

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === otherValue) {
                textInput.disabled = false;
                textInput.required = true;
                textInput.focus();
            } else {
                textInput.disabled = true;
                textInput.required = false;
                textInput.value = ''; // Limpiar si cambia de opción
            }
        });
    });
}

// Inicializar listeners para Q5, Q6, Q7
setupOtherToggle('anio_ingreso', 'anio_ingreso_otro', 'Otro');
setupOtherToggle('modalidad_ingreso', 'modalidad_ingreso_otra', 'Otra'); // Ojo: value en HTML es 'Otra'
setupOtherToggle('tiempo_terminar', 'tiempo_terminar_otro', 'Otro');



function updateQ14Options() {
    const container = document.getElementById('q14-options');
    if (!container) return;
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
        container.innerHTML = '<p class="text-slate-400 italic text-sm">Selecciona opciones en la pregunta 23 primero.</p>';
    }
}

// --- VALIDADCIÓN Q10 (Dummy Removed) ---
// La validación se hace directamente en goToSection2 con lógica visual explícita

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
    loadLists();
    renderSemesters();
    renderBottomRows();
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
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    // Poblar datalist con materias
    populateMateriasList().then(() => {
        // Inicializar Multi-Selects después de cargar materias (incluyendo fetch async)
        // IDs actualizados a Q15 (Rept) y Q16 (Dif)
        setupMultiSelect('input-q15', 'dropdown-q15', 'tags-container-q15', 'hidden-q15', 'error-q15');
        setupMultiSelect('input-q16', 'dropdown-q16', 'tags-container-q16', 'hidden-q16', 'error-q16');
    });
}

// --- POPULAR DATALIST ---
async function populateMateriasList() {
    const datalist = document.getElementById('materias-list');
    if (!datalist) return;

    // Evitar duplicados
    const uniqueSubjects = new Set();
    const addFn = (name) => {
        if (!name) return;
        const cleanName = name.trim();
        if (!uniqueSubjects.has(cleanName)) {
            uniqueSubjects.add(cleanName);
            const opt = document.createElement('option');
            opt.value = cleanName;
            datalist.appendChild(opt);
        }
    };

    // 1. Desde variables estáticas
    semesterData.forEach(sem => sem.subjects.forEach(addFn));
    electivasData.forEach(addFn);
    talleresData.forEach(addFn);
    Object.values(abordajesData).forEach(mod => {
        if (mod.sem9) mod.sem9.forEach(s => addFn(s.name));
        if (mod.sem10) mod.sem10.forEach(s => addFn(s.name));
    });

    // 2. Desde materias.txt (Async)
    try {
        const response = await fetch('materias.txt');
        if (response.ok) {
            const text = await response.text();
            if (text) {
                text.split('\n').forEach(line => addFn(line));
            }
        }
    } catch (e) {
        console.warn("No se pudo cargar materias.txt", e);
    }
}


// --- LÓGICA SEARCHABLE MULTI-SELECT ---
function setupMultiSelect(inputId, dropdownId, tagsContainerId, hiddenInputId, errorId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const tagsContainer = document.getElementById(tagsContainerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const errorMsg = document.getElementById(errorId);
    const datalist = document.getElementById('materias-list');

    if (!input || !dropdown || !tagsContainer || !hiddenInput || !datalist) return;

    let selectedTags = [];

    // Helper: Leer opciones actuales (ya pobladas)
    const getOptions = () => Array.from(datalist.options).map(opt => opt.value);

    input.addEventListener('focus', () => {
        renderDropdown(getOptions());
        dropdown.classList.remove('hidden');
    });

    // Helper de normalización para búsqueda insensible a acentos/mayúsculas
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    input.addEventListener('input', () => {
        const query = normalize(input.value.trim());
        const allOptions = getOptions();

        const filtered = allOptions.filter(opt => normalize(opt).includes(query));

        renderDropdown(filtered);
        dropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
            input.value = '';
        }
    });

    function renderDropdown(options) {
        dropdown.innerHTML = '';
        if (options.length === 0) {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 text-slate-400 italic cursor-default';
            li.textContent = 'No encontrado';
            dropdown.appendChild(li);
            return;
        }

        options.forEach(opt => {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-700 transition-colors';
            li.textContent = opt;
            li.addEventListener('click', () => {
                selectItem(opt);
            });
            dropdown.appendChild(li);
        });
    }

    function selectItem(item) {
        if (!selectedTags.includes(item)) {
            selectedTags.push(item);
            renderTags();
            updateHidden();
            errorMsg.classList.add('hidden');
        }
        input.value = '';
        dropdown.classList.add('hidden');
        input.focus();
    }

    function renderTags() {
        tagsContainer.innerHTML = '';
        selectedTags.forEach((tag, idx) => {
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200 animate-fade-in';
            badge.innerHTML = `
                ${tag} 
                <button type="button" class="text-blue-400 hover:text-red-500 font-bold ml-1 focus:outline-none" data-index="${idx}">&times;</button>
            `;
            badge.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                removeTag(idx);
            });
            tagsContainer.appendChild(badge);
        });
    }

    function removeTag(index) {
        selectedTags.splice(index, 1);
        renderTags();
        updateHidden();
    }

    function updateHidden() {
        hiddenInput.value = selectedTags.join(', ');
    }
}

// --- SISTEMA DE GUARDADO (LOCALSTORAGE) ---
function saveData() {
    const state = {};
    const names = {};

    const metadata = {};

    document.querySelectorAll('.materia-card').forEach(card => {
        // Guardar estado
        if (card.dataset.status !== 'pendiente') {
            state[card.id] = card.dataset.status;
        }
        // Guardar nombres personalizados si difieren del original
        if (card.dataset.originalName !== card.innerText && !card.dataset.selectedWorkshop) {
            names[card.id] = card.innerText;
        }
        // Guardar metadata (Talleres & Electivas)
        if (card.dataset.customSelection) {
            metadata[card.id] = { customSelection: card.dataset.customSelection };
        } else if (card.dataset.selectedWorkshop) { // Legacy check
            metadata[card.id] = { customSelection: card.dataset.selectedWorkshop };
        }
    });

    // Guardamos también la modalidad seleccionada
    const data = { state, names, modality: currentModality, metadata };
    localStorage.setItem('mallaCurricularData', JSON.stringify(data));

    showSaveToast();
}

function loadData() {
    const rawData = localStorage.getItem('mallaCurricularData');
    if (!rawData) return;

    try {
        const { state, names, modality, metadata } = JSON.parse(rawData);

        // Restaurar Modalidad
        if (modality && abordajesData[modality]) {
            currentModality = modality;
        }

        // Hack: Guardamos los datos cargados en variable global para aplicarlos después del render
        window.loadedState = state;
        window.loadedNames = names;
        window.loadedMetadata = metadata;

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

    if (window.loadedMetadata) {
        Object.keys(window.loadedMetadata).forEach(id => {
            const card = document.getElementById(id);
            if (card && window.loadedMetadata[id].selectedWorkshop) {
                const sel = window.loadedMetadata[id].selectedWorkshop;
                card.dataset.selectedWorkshop = sel;
                const originalTitle = card.dataset.originalName || "Taller";
                card.innerHTML = `<div class="font-bold pointer-events-none">${originalTitle}</div><div class="text-[10px] leading-tight mt-1 text-blue-800 font-normal pointer-events-none">${sel}</div>`;
                card.classList.remove('items-center');
                card.classList.add('flex-col', 'justify-center');
            }
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
    if (toast) {
        toast.classList.remove('opacity-0');
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            toast.classList.add('opacity-0');
        }, 2000);
    }
}

// --- FUNCIONES DE MODALIDAD ---
function changeModality(selectElement) {
    saveData(); // Guardar estado actual (semestres 1-8 y 10)
    loadData(); // Cargar ese estado en memoria (window.loadedState)

    const oldModality = currentModality;
    const newModality = selectElement.value;
    currentModality = newModality;

    renderSemesters(); // Re-renderizar para mostrar las nuevas materias
    // Aplicar estados guardados a las nuevas tarjetas generadas
    applyLoadedData();

    // Migrar estados de Semestre 10 si los nombres coinciden
    if (oldModality && abordajesData[oldModality] && abordajesData[newModality]) {
        const oldSem10 = abordajesData[oldModality].sem10 || [];
        const newSem10 = abordajesData[newModality].sem10 || [];

        oldSem10.forEach((subj, index) => {
            const oldId = `mod10-${oldModality}-${index}`;
            if (window.loadedState && window.loadedState[oldId]) {
                // Verificar coincidencia de nombre en el mismo índice
                if (newSem10[index] && newSem10[index].name === subj.name) {
                    const newId = `mod10-${newModality}-${index}`;
                    const card = document.getElementById(newId);
                    if (card) {
                        const status = window.loadedState[oldId];
                        card.dataset.status = status;
                        updateCardStyle(card, status);
                    }
                }
            }
        });
    }

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

    card.onclick = () => {
        if (id.startsWith('taller-') || id.startsWith('elec-')) {
            openSelectionModal(card);
        } else {
            applyTool(card);
        }
    };
    card.ondblclick = () => {
        if (!id.startsWith('taller-') && !id.startsWith('elec-')) {
            openEditModal(card);
        }
    };

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
    if (active) {
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

    if (icons[status]) {
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
if (editInput) {
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
}

const editModal = document.getElementById('edit-modal');
if (editModal) {
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
}

// --- VALIDACIÓN DE REGISTRO UNIVERSITARIO EN TIEMPO REAL ---
const inputRegistro = document.getElementById('input-registro');
const errorDiv = document.getElementById('error-registro');
const submitBtn = document.querySelector('#submit-form-section1');

let timerValidacion;

if (inputRegistro) {
    // Validar mientras escribe (evento input)
    inputRegistro.addEventListener('input', function () {
        const registro = this.value.trim();

        clearTimeout(timerValidacion);

        if (registro === '') {
            errorDiv.classList.add('hidden');
            this.classList.remove('invalid');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Continuar <i class="fas fa-arrow-right ml-2"></i>';
            // Cerrar modal si existe
            const modal = document.getElementById('duplicate-registry-modal');
            if (modal && !modal.classList.contains('hidden')) {
                closeDuplicateModal();
            }
            return;
        }

        if (!/^\d+$/.test(registro)) {
            errorDiv.classList.remove('hidden');
            this.classList.add('invalid');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Formato inválido';
            return;
        }

        // Mostrar indicador de validación mientras se procesa
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
        }

        // Debounce muy corto a 100ms para respuesta más rápida
        timerValidacion = setTimeout(() => {
            validarRegistroEnTiempoReal(registro, this);
        }, 100);
    });

    // Validar cuando sale del campo
    inputRegistro.addEventListener('blur', function () {
        clearTimeout(timerValidacion);
        const registro = this.value.trim();

        if (registro !== '' && /^\d+$/.test(registro)) {
            validarRegistroEnTiempoReal(registro, this);
        }
    });

    // Limpiar estilos cuando empieza a escribir
    inputRegistro.addEventListener('focus', function () {
        if (this.value.trim() === '') {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        }
    });
}

function closeDuplicateModal() {
    const modal = document.getElementById('duplicate-registry-modal');
    if (modal) {
        modal.classList.remove('animate-in');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
function verificarRegistroDuplicado(registro) {
    return new Promise((resolve) => {
        console.log('Verificando registro duplicado:', registro);

        // Verificar en Firebase si este registro ya completó la encuesta
        if (window.db && window.firebaseModules) {
            console.log('Firebase disponible globalmente');

            const { collection, query, where, getDocs } = window.firebaseModules;

            if (collection && query && where && getDocs) {
                try {
                    const q = query(
                        collection(window.db, 'encuestas_estudiantes'),
                        where('personal.registro', '==', registro)
                    );
                    console.log(' Ejecutando consulta Firebase...');

                    getDocs(q).then(querySnapshot => {
                        console.log(' Resultado de consulta:', querySnapshot.size, 'documentos encontrados');

                        if (!querySnapshot.empty) {
                            // Ya existe
                            const docData = querySnapshot.docs[0].data();
                            const personal = docData.personal || {};
                            console.log(' DUPLICADO ENCONTRADO:', personal.nombre, personal.apellidos);

                            // DEV: Devolver toooooodos los datos para poder generar el PDF
                            resolve({
                                existe: true,
                                nombre: personal.nombre || '-',
                                apellidos: personal.apellidos || '-',
                                fullData: docData // <--- GUARDAMOS TODO AQU
                            });
                        } else {
                            console.log(' Registro disponible (no hay duplicado)');
                            resolve({ existe: false });
                        }
                    }).catch(err => {
                        console.error(' Error en consulta Firebase:', err);
                        resolve({ existe: false });
                    });
                } catch (err) {
                    console.error(' Error preparando consulta:', err);
                    resolve({ existe: false });
                }
            } else {
                console.error(' Módulos Firebase NO completos');
                resolve({ existe: false });
            }
        } else {
            console.error(' window.db no existe. Disponible:', window.db ? 'db' : 'NO db', window.firebaseModules ? 'modules' : 'NO modules');
            resolve({ existe: false });
        }
    });
}

function validarRegistroEnTiempoReal(registro, inputElement) {
    console.log(' VALIDACIÓN INICIADA para registro:', registro);

    // Si aún no se cargaron los registros, esperar
    if (!window.registrosCargados) {
        console.warn(' Aún procesando registros...');
        if (errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Cargando base de datos...</span>';
            errorDiv.classList.remove('hidden');
        }
        // Ocultar éxito si estaba
        const successDiv = document.getElementById('success-registro');
        if (successDiv) successDiv.classList.add('hidden');

        if (submitBtn) submitBtn.disabled = true;

        // Reintentar cuando estén listos
        const intentar = setInterval(() => {
            if (window.registrosCargados) {
                clearInterval(intentar);
                console.log(' Registros listos, reintentando validación...');
                validarRegistroEnTiempoReal(registro, inputElement);
            }
        }, 100);
        return;
    }

    console.log(' Registros cargados. Total en memoria:', window.registrosValidos?.size || 0);

    // Validar contra los registros cargados
    const existe = window.registrosValidos && window.registrosValidos.has(registro);
    const successDiv = document.getElementById('success-registro');

    console.log(` Validando: ${registro}  ${existe ? ' VÁLIDO EN DATOS.TXT' : ' NO VÁLIDO EN DATOS.TXT'}`);

    if (existe) {
        console.log(' Registro existe en datos.txt. Verificando duplicado en Firebase...');
        // Registro válido - Ahora verificar si es duplicado en Firebase INMEDIATAMENTE
        verificarRegistroDuplicado(registro).then(resultado => {
            console.log(' Resultado Firebase:', resultado);

            if (resultado.existe) {
                // GUARDAR DATOS GLOBALES PARA EL PDF
                window.existingSurveyData = resultado.fullData;
                console.log(" Datos previos cargados para reporte PDF:", window.existingSurveyData);

                // MOSTRAR MODAL INMEDIATAMENTE - BLOQUEADOR
                console.warn(' DUPLICADO ENCONTRADO - Mostrando modal');
                const modal = document.getElementById('duplicate-registry-modal');
                console.log('Modal element existe:', !!modal);

                if (modal) {
                    // Rellenar datos del usuario que ya respondió
                    document.getElementById('duplicate-nombre').textContent = resultado.nombre;
                    document.getElementById('duplicate-apellidos').textContent = resultado.apellidos;
                    document.getElementById('dup-reg-number').textContent = registro;

                    // Configurar botón de descarga PDF
                    const btnDownload = document.getElementById('btn-download-duplicate-pdf');
                    if (btnDownload) {
                        btnDownload.onclick = () => {
                            descargarReportePDF(registro);
                        };
                    }

                    console.log('Nombre:', resultado.nombre);
                    console.log('Apellidos:', resultado.apellidos);

                    // Mostrar modal INMEDIATO sin esperas
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');

                    console.log(' Modal visible - Clases aplicadas');

                    // Auto-scroll al modal
                    setTimeout(() => {
                        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                }

                // Ocultar mensaje de éxito
                if (successDiv) successDiv.classList.add('hidden');

                // Mensaje de error prominente
                if (errorDiv) {
                    errorDiv.innerHTML = '<i class="fas fa-times-circle"></i> <span style="font-weight: bold;"> Este registro ya fue utilizado</span>';
                    errorDiv.classList.remove('hidden');
                    errorDiv.style.backgroundColor = '#fee2e2';
                    errorDiv.style.borderColor = '#dc2626';
                    errorDiv.style.color = '#991b1b';
                }

                // BLOQUEAR COMPLETAMENTE
                inputElement.classList.add('invalid');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.4';
                    submitBtn.style.cursor = 'not-allowed';
                    submitBtn.innerHTML = 'Registro no disponible';
                }

                // Estilo rojo oscuro
                inputElement.style.borderColor = '#dc2626';
                inputElement.style.backgroundColor = '#fef2f2';
                inputElement.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.2)';
            } else {
                console.log(' Registro disponible (sin duplicado)');
                // Registro válido y NO duplicado - DESBLOQUEAR
                const modal = document.getElementById('duplicate-registry-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    closeDuplicateModal();
                }

                // Feedback Visual: OCULTAR ERROR, MOSTRAR ÉXITO
                if (errorDiv) {
                    errorDiv.classList.add('hidden');
                    errorDiv.removeAttribute('style');
                }

                if (successDiv) {
                    successDiv.classList.remove('hidden');
                }

                inputElement.classList.remove('invalid');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.innerHTML = 'Continuar <i class="fas fa-arrow-right ml-2"></i>';
                }

                inputElement.style.borderColor = '#10b981';
                inputElement.style.backgroundColor = '#f0fdf4';
                inputElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
            }
        }).catch(err => {
            console.error('Error en Promise:', err);
        });
    } else {
        console.log('Registro NO existe en datos.txt');
        // Registro inválido - NO ESTÁ EN LA BASE DE DATOS

        // Feedback Visual: MOSTRAR ERROR, OCULTAR ÉXITO
        if (successDiv) successDiv.classList.add('hidden');

        if (errorDiv) {
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>El registro no está registrado en la carrera de Psicología</span>';
            errorDiv.classList.remove('hidden');
            errorDiv.removeAttribute('style');
            errorDiv.className = 'text-red-500 text-sm mt-1';
        }

        inputElement.classList.add('invalid');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Registro no válido';
        }

        inputElement.style.borderColor = '#ef4444';
        inputElement.style.backgroundColor = '#fef2f2';
        inputElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    }
}

// Validar al enviar el formulario
const formSection1 = document.getElementById('form-section1');
if (formSection1) {
    formSection1.addEventListener('submit', function (e) {
        if (inputRegistro) {
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
                console.error('Intento de envío con registro inválido:', registro);
                return false;
            }

            // Verificar si es duplicado (ya respondió)
            if (submitBtn.disabled && submitBtn.innerHTML.includes('Encuesta ya respondida')) {
                e.preventDefault();
                const modal = document.getElementById('duplicate-registry-modal');
                if (modal && modal.classList.contains('hidden')) {
                    // Si el modal está oculto, mostrarlo
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                    void modal.offsetWidth;
                    modal.classList.add('animate-in');
                }
                console.error('Intento de reenvío con registro duplicado:', registro);
                return false;
            }
        }

        console.log(' Formulario válido, procediendo con envío...');
        // Llamar a goToSection2 manualmente si no es un submit nativo
        goToSection2(e);
        return true;
    });
}

// Escuchar evento de carga de registros
window.addEventListener('registrosCargados', (e) => {
    console.log(` Registros listos: ${e.detail.cantidad} estudiantes cargados`);

    // Si el usuario ya escribió algo, validar inmediatamente
    if (inputRegistro) {
        const registro = inputRegistro.value.trim();
        if (registro && /^\d+$/.test(registro)) {
            validarRegistroEnTiempoReal(registro, inputRegistro);
        }
    }
});

// --- FUNCIÓN AUXILIAR: Capturar datos de formularios dinámicamente ---
function capturarTodosDatos() {
    console.log(' CAPTURANDO TODOS LOS DATOS DE FORMULARIOS...');

    // Obtener datos base de window.surveyData
    let allData = JSON.parse(JSON.stringify(window.surveyData));

    // Si la malla está vacía, intentar capturarla del DOM
    if (!allData.malla || allData.malla.length === 0) {
        console.log(' Malla vacía en surveyData, intentando capturar del DOM...');
        const mallaCards = document.querySelectorAll('.materia-card');
        if (mallaCards.length > 0) {
            allData.malla = Array.from(mallaCards).map(card => ({
                id: card.id,
                nombre: card.innerText,
                estado: card.dataset.status
            }));
            console.log(' Malla capturada del DOM:', allData.malla);
        }
    }

    // Capturar datos de Section 1 si los formularios aún están disponibles
    const form1 = document.getElementById('form-section1');
    if (form1 && Object.keys(allData.personal).length === 0) {
        console.log(' Personal vacío, capturando de form-section1...');
        const formData1 = new FormData(form1);
        const semestresSeleccionados = formData1.getAll('semestre');
        const veranoAprobadas = formData1.getAll('materias_verano_aprobadas');
        const veranoReprobadas = formData1.getAll('materias_verano_reprobadas');

        allData.personal = {
            nombre: formData1.get('nombre') || '',
            apellidos: formData1.get('Apellidos') || formData1.get('apellidos') || '',
            CI: formData1.get('CI') || '',
            registro: formData1.get('registro') || '',
            anio_ingreso: formData1.get('anio_ingreso') || '',
            modalidad_ingreso: formData1.get('modalidad_ingreso') || '',
            tiempo_terminar: formData1.get('tiempo_terminar') || '',
            celular: formData1.get('celular') || '',
            correo: formData1.get('correo') || '',
            semestre: semestresSeleccionados,
            ppa: formData1.get('ppa') || '',
            carga_academica: formData1.get('carga_academica') || '',
            materias_aprobadas: formData1.get('materias_aprobadas') || '',
            materias_reprobadas: formData1.get('materias_reprobadas') || '',
            repetido_materia: formData1.get('repetido_materia') || '',
            materias_repetidas_nombres: formData1.get('materias_repetidas_nombres') || '',
            materias_dificultad: formData1.get('materias_dificultad') || '',
            // NUEVO P17
            materias_verano_aprobadas: veranoAprobadas,
            materias_verano_reprobadas: veranoReprobadas,
            // RENUMERADOS
            trabaja: formData1.get('trabaja') || '',
            horas_estudio: formData1.get('horas_estudio') || '',
            avance: formData1.get('avance') || ''
        };
        console.log(' Personal capturado de form-section1:', allData.personal);
    }

    // Capturar Section 2 si está disponible
    const form10 = document.getElementById('form-q10');
    if (form10 && Object.keys(allData.seccion2_cierre).length === 0) {
        console.log(' Sección 2 vacía, capturando de form-q10...');
        const formData10 = new FormData(form10);
        allData.seccion2_cierre.q10 = formData10.get('q10') || '';
        const q10Text = document.getElementById('q10-text');
        if (q10Text && !q10Text.disabled) {
            allData.seccion2_cierre.explicacion = q10Text.value || '';
        }
        console.log(' Sección 2 capturada:', allData.seccion2_cierre);
    }

    // Capturar Section 3 si está disponible
    const form3 = document.querySelector('form[data-section="3"]');
    if (form3 && Object.keys(allData.seccion3).length === 0) {
        console.log(' Sección 3 vacía, capturando de formulario...');
        allData.seccion3.q11 = document.querySelector('input[name="q11"]:checked')?.value || '';
        const q12Option = document.querySelector('input[name="q12"]:checked')?.value;
        allData.seccion3.q12 = q12Option || '';
        if (q12Option === 'Otra' || q12Option === 'otra') {
            const q12Text = document.getElementById('q12-text');
            allData.seccion3.q12_otra = q12Text?.value || '';
        }
        console.log(' Sección 3 capturada:', allData.seccion3);
    }

    // Capturar Section 4 si está disponible
    const form4 = document.querySelector('form[data-section="4"]');
    if (form4 && Object.keys(allData.seccion4).length === 0) {
        console.log(' Sección 4 vacía, capturando de formulario...');
        const q13Selected = Array.from(document.querySelectorAll('.q13-check:checked')).map(c => c.value);
        allData.seccion4.q13 = q13Selected;
        const checkOtros = document.getElementById('q13-otros');
        if (checkOtros && checkOtros.checked) {
            const q13Text = document.getElementById('q13-text');
            allData.seccion4.q13_otros = q13Text?.value || '';
        }
        allData.seccion4.prioridad = document.querySelector('input[name="q14"]:checked')?.value || '';
        console.log(' Sección 4 capturada:', allData.seccion4);
    }

    // Capturar Section 5 si está disponible
    const form5 = document.getElementById('form-section5');
    if (form5 && Object.keys(allData.seccion5).length === 0) {
        console.log(' Sección 5 vacía, capturando de form-section5...');
        const formData5 = new FormData(form5);
        allData.seccion5.propuesta = formData5.get('propuesta') || '';
        console.log(' Sección 5 capturada:', allData.seccion5);
    }

    console.log(' TODOS LOS DATOS CAPTURADOS:', allData);
    return allData;
}

// --- FUNCIÓN PARA DESCARGAR REPORTE PDF ---
function descargarReportePDF() {
    console.log(' INICIANDO DESCARGA DE PDF...');

    // 1. Determinar fuente de datos: ¿Nueva encuesta o Datos cargados de Firebase?
    let allData;
    if (window.existingSurveyData) {
        console.log(' Usando datos existentes cargados desde Firebase');
        allData = window.existingSurveyData;
    } else {
        console.log(' Usando datos de la sesión actual');
        allData = capturarTodosDatos();
    }

    const data = allData.personal || {};
    const malla = allData.malla || [];
    const seccion2_cierre = allData.seccion2_cierre || {};
    const seccion3 = allData.seccion3 || {};
    const seccion4 = allData.seccion4 || {};
    const seccion5 = allData.seccion5 || {};

    console.log(' Datos para PDF listos:', allData);

    const nombre = data.nombre || '-';
    const apellidos = data.apellidos || '-';
    const registro = data.registro || '-';
    const ci = data.CI || '-';
    const celular = data.celular || '-';
    const correo = data.correo || '-';

    // Validar si semestre es array o string
    let semestreStr = '-';
    if (Array.isArray(data.semestre)) {
        semestreStr = data.semestre.join(', ');
    } else if (data.semestre) {
        semestreStr = data.semestre;
    }

    // Datos académicos
    const anioIngreso = data.anio_ingreso || '-';
    const modalidadIngreso = data.modalidad_ingreso || '-';
    const tiempoTerminar = data.tiempo_terminar || '-';
    const ppa = data.ppa || '-';
    const carga = data.carga_academica || '-';
    const matAprob = data.materias_aprobadas || '-';
    const matReprob = data.materias_reprobadas || '-';
    const repitio = data.repetido_materia || '-';
    // Si repitió, mostrar cuáles
    const repitioCual = (repitio === 'Sí' && data.materias_repetidas_nombres)
        ? `(${data.materias_repetidas_nombres})`
        : '';
    const matDificultad = data.materias_dificultad || 'Ninguna especificada';

    // NUEVO P17
    let veranoAprob = '-';
    if (data.materias_verano_aprobadas && data.materias_verano_aprobadas.length > 0) {
        veranoAprob = data.materias_verano_aprobadas.join(', ');
    }
    let veranoReprob = '-';
    if (data.materias_verano_reprobadas && data.materias_verano_reprobadas.length > 0) {
        veranoReprob = data.materias_verano_reprobadas.join(', ');
    }

    // Datos laborales
    const trabaja = data.trabaja || '-';
    const horas = data.horas_estudio || '-';
    const avance = data.avance || '-';

    // Preguntas
    const p10 = seccion2_cierre.q10 || '-';
    const p10Exp = (seccion2_cierre.q10 === 'Depende' && seccion2_cierre.explicacion)
        ? `(Por: ${seccion2_cierre.explicacion})`
        : '';

    const p11 = seccion3.q11 || '-';

    let p12 = seccion3.q12 || '-';
    if ((p12 === 'Otra' || p12 === 'otra') && seccion3.q12_otra) {
        p12 = seccion3.q12_otra;
    }

    let p13 = '-';
    if (Array.isArray(seccion4.q13)) {
        p13 = seccion4.q13.join(', ');
        if (seccion4.q13.includes('Otros') && seccion4.q13_otros) {
            p13 += ` (${seccion4.q13_otros})`;
        }
    } else if (seccion4.q13) {
        p13 = seccion4.q13;
    }

    const prioridad = seccion4.prioridad || '-';
    const propuesta = seccion5.propuesta || 'Sin comentarios.';

    // --- LÓGICA DE VISUALIZACIÓN TIPO ADMIN PANEL (Malla Horizontal COMPLETA) ---

    // 1. Definir la estructura base estática (Todos los semestres)
    // Usamos las variables globales semesterData, electivasData, talleresData definidas al inicio del script

    // Preparar columnas
    const columns = {};
    for (let i = 0; i <= 10; i++) columns[i] = [];

    // Detectar modalidad del usuario para semestres 9 y 10
    // Buscamos en los datos guardados si hay alguna materia de 9no/10mo para inferir la modalidad
    let userModality = 'humanista'; // Default
    const modalityMatch = malla.find(m => m.id && m.id.includes('mod9-'));
    if (modalityMatch) {
        const parts = modalityMatch.id.split('-');
        if (parts.length >= 2) userModality = parts[1];
    }
    console.log("Modalidad detectada para PDF:", userModality);

    // 2. Llenar columnas con datos ESTÁTICOS (La malla vacía completa)

    // Semestres 1-8 (ndices 0-7)
    for (let i = 0; i <= 7; i++) {
        const semInfo = semesterData[i]; // { title: "...", subjects: [...] }
        if (semInfo && semInfo.subjects) {
            semInfo.subjects.forEach((subjName, idx) => {
                // ID teórico para búsqueda
                const staticId = `sem-${i}-${idx}`;
                columns[i].push({ id: staticId, nombre: subjName, estado: 'pendiente' }); // Estado default
            });
        }
    }

    // Semestres 9-10 (ndices 8-9) - Dependen de la modalidad
    // Usamos abordajesData global
    const abordaje = abordajesData[userModality] || abordajesData['humanista'];

    // Semestre 9
    // Materia común S9 (Ética I)
    if (semesterData[8] && semesterData[8].subjects) {
        semesterData[8].subjects.forEach((subjName, idx) => {
            columns[8].push({ id: `sem-8-${idx}`, nombre: subjName, estado: 'pendiente' });
        });
    }
    // Materias de modalidad S9
    if (abordaje && abordaje.sem9) {
        abordaje.sem9.forEach((subj, idx) => {
            columns[8].push({ id: `mod9-${userModality}-${idx}`, nombre: subj.name, estado: 'pendiente' });
        });
    }

    // Semestre 10
    // Materia común S10 (Ética II)
    if (semesterData[9] && semesterData[9].subjects) {
        semesterData[9].subjects.forEach((subjName, idx) => {
            columns[9].push({ id: `sem-9-${idx}`, nombre: subjName, estado: 'pendiente' });
        });
    }
    // Materias de modalidad S10
    if (abordaje && abordaje.sem10) {
        abordaje.sem10.forEach((subj, idx) => {
            columns[9].push({ id: `mod10-${userModality}-${idx}`, nombre: subj.name, estado: 'pendiente' });
        });
    }

    // Electivas y Talleres (Columna 10)
    // Electivas
    electivasData.forEach((subjName, idx) => {
        columns[10].push({ id: `elec-${idx}`, nombre: subjName, estado: 'pendiente' });
    });
    // Talleres
    talleresData.forEach((subjName, idx) => {
        columns[10].push({ id: `taller-${idx}`, nombre: subjName, estado: 'pendiente' });
    });


    // 3. SOBRESCRIBIR con el estado real del usuario
    // Recorremos la 'malla' del usuario y actualizamos el estado en 'columns'
    malla.forEach(userSubj => {
        if (!userSubj.id) return;

        // Buscar esta materia en nuestra estructura estática 'columns'
        // Lo hacemos buscando por ID

        let found = false;
        // Búsqueda ineficiente pero segura (son pocos datos)
        for (let c = 0; c <= 10; c++) {
            const matchIndex = columns[c].findIndex(staticSubj => staticSubj.id === userSubj.id);
            if (matchIndex !== -1) {
                columns[c][matchIndex].estado = userSubj.estado;
                found = true;
                break;
            }
        }
    });


    // 4. GENERAR HTML (Visualización)

    // Colores exactos del Admin Panel adaptados a estilos inline
    const stylesMap = {
        aprobado: { bg: '#dcfce7', text: '#14532d', border: '#86efac', icon: '' },
        reprobado: { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5', icon: '' },
        levantamiento: { bg: '#e0f2fe', text: '#0c4a6e', border: '#7dd3fc', icon: '' },
        pendiente: { bg: '#ffffff', text: '#94a3b8', border: '#e2e8f0', icon: '' }
    };

    let mallaHTML = `<div style="display: flex; gap: 4px; overflow-x: visible; width: 100%; justify-content: space-between;">`;

    for (let i = 0; i <= 10; i++) {
        // Omitir columnas vacías si se desea, pero para estructura constante mejor mostrar 1-10 siempre
        // Aunque el admin panel muestra 10 + extras. Si la 10 (extras) está vacía, podríamos saltarla.
        if (i === 10 && columns[i].length === 0) continue;

        let semTitle = (i < 10) ? `${i + 1}º` : "E/T";

        mallaHTML += `<div style="display: flex; flex-direction: column; gap: 3px; width: 8.5%; min-width: 45px;">
            <div style="text-align: center; font-size: 8px; font-weight: bold; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-bottom: 2px;">${semTitle}</div>`;

        columns[i].forEach(m => {
            const st = stylesMap[m.estado] || stylesMap.pendiente;

            // Determine Name to Display
            let displayName = m.nombre;
            // Si el usuario tiene una selección personalizada, la usamos
            const userSubj = malla.find(u => u.id === m.id);
            if (userSubj && userSubj.customSelection) {
                // Formatting: "Original: Selected" or just "Selected" depending on length
                // User prefers to see what they selected.
                displayName = userSubj.customSelection;
            }

            // Recortar nombre si es muy largo
            let shortName = displayName;
            if (shortName.length > 25) {
                shortName = shortName.substring(0, 23) + '..'; // Increased limit slightly
            }

            // Adjustment for tiny font if still too long or custom
            const fontSize = (displayName.length > 20) ? '6px' : '7px';

            mallaHTML += `<div style="
                background-color: ${st.bg};
                color: ${st.text};
                border: 1px solid ${st.border};
                border-radius: 3px;
                padding: 2px;
                font-size: ${fontSize};
                line-height: 1.1;
                text-align: center;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                word-break: break-all; 
            " title="${displayName} (${m.estado})">
                ${shortName}
                ${st.icon ? `<div style="position: absolute; top: 0px; right: 1px; font-size: 6px; opacity: 0.7;">${st.icon}</div>` : ''}
            </div>`;
        });

        if (columns[i].length === 0) {
            mallaHTML += `<div style="text-align:center; color:#cbd5e1; font-size:7px; font-style:italic; padding-top:5px;">-</div>`;
        }

        mallaHTML += `</div>`;
    }
    mallaHTML += `</div>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            body { font-family: 'Roboto', Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; background: #fff; max-width: 800px; mx-auto; }
            
            /* Header */
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; }
            .header-logo img { height: 60px; widht: auto; } 
            .header-text { text-align: right; }
            .header-title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; text-transform: uppercase; }
            .header-sub { font-size: 12px; color: #6b7280; font-weight: 500; margin-top: 5px; }
            
            /* Sections */
            .section { margin-bottom: 25px; background: #fff; }
            .section-header { background: #f1f5f9; color: #0f172a; padding: 8px 12px; font-size: 13px; font-weight: 800; border-left: 5px solid #1e3a8a; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
            
            /* Grids */
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            
            /* Data Fields */
            .field-box { margin-bottom: 8px; }
            .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
            .value { font-size: 12px; font-weight: 500; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; min-height: 16px; }
            .value-highlight { color: #1e3a8a; font-weight: 800; }
            
            /* Legend */
            .legend { display: flex; gap: 15px; justify-content: flex-end; margin-bottom: 10px; font-size: 10px; }
            .legend-item { display: flex; align-items: center; gap: 4px; }
            .dot { width: 10px; height: 10px; border-radius: 50%; }
            
            /* Footer */
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 9px; border-top: 1px solid #f3f4f6; padding-top: 15px; }
            
            /* Propuesta text area look */
            .propuesta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; font-size: 12px; line-height: 1.5; color: #374151; font-style: italic; }
            
            /* Page break safety */
            .keep-together { break-inside: avoid; }
        </style>
    </head>
    <body>

        <!-- Header -->
        <div class="header-container">
            <div class="header-logo">
                 <!-- Podrías poner base64 del logo aquí si quisieras, por ahora texto estilizado o placeholder si no carga img externa -->
                 <img style="width: 150px; height: auto;" src="img/Encabezado.png" alt="Logo" class="object-contain bg-white rounded p-1 shadow-sm">
            </div>
            <div class="header-text">
                <h1 class="header-title">Reporte de Situación Académica</h1>
                <p class="header-sub">Proceso de transición curricular - Carrera de Psicología</p>
                <p class="header-sub">Generado: ${new Date().toLocaleDateString('es-ES')} | REGISTRO: ${registro}</p>
            </div>
        </div>

        <!-- Section 1: Personal -->
        <div class="section keep-together">
            <div class="section-header"><span></span> Datos Personales y Académicos</div>
            
            <div class="grid-3">
                <div class="field-box">
                    <div class="label">Registro Universitario</div>
                    <div class="value value-highlight">${registro}</div>
                </div>
                <div class="field-box">
                    <div class="label">Cédula de Identidad</div>
                    <div class="value">${ci}</div>
                </div>
                <div class="field-box">
                    <div class="label">Nombre Completo</div>
                    <div class="value">${nombre} ${apellidos}</div>
                </div>
            </div>
            
            <div class="grid-3">
                <div class="field-box">
                    <div class="label">Semestre Actual</div>
                    <div class="value">${semestreStr}</div>
                </div>
                 <div class="field-box">
                    <div class="label">Carga Actual</div>
                    <div class="value">${carga} Materias</div>
                </div>
                <div class="field-box">
                    <div class="label">Contacto</div>
                    <div class="value">${celular}</div>
                </div>
            </div>

            <div class="grid-2">
                 <div class="field-box">
                    <div class="label">Correo Electrónico</div>
                    <div class="value" style="font-size:11px;">${correo}</div>
                </div>
                 <div class="field-box">
                    <div class="label">Año de Ingreso / Modalidad</div>
                    <div class="value">${anioIngreso} - ${modalidadIngreso}</div>
                </div>
            </div>
        </div>

        <!-- Section 2: Historial -->
        <div class="section keep-together">
            <div class="section-header"><span></span> Historial y Rendimiento</div>
            <div class="grid-3">
                <div class="field-box">
                    <div class="label">PPA Aprox.</div>
                    <div class="value" style="color:#6b21a8; font-weight:700;">${ppa}</div>
                </div>
                <div class="field-box">
                    <div class="label">Mat. Aprobadas</div>
                    <div class="value" style="color:#059669; font-weight:700;">${matAprob}</div>
                </div>
                <div class="field-box">
                    <div class="label">Mat. Reprobadas</div>
                    <div class="value" style="color:#dc2626; font-weight:700;">${matReprob}</div>
                </div>
            </div>
            <div class="grid-2">
                <div class="field-box">
                    <div class="label">Tiempo Estimado Finalizacón</div>
                    <div class="value">${tiempoTerminar}</div>
                </div>
                <div class="field-box">
                    <div class="label">Repitencia (>3 veces)</div>
                    <div class="value">${repitio} ${repitioCual}</div>
                </div>
            </div>
            <div class="field-box" style="margin-bottom:12px;">
                <div class="label">Materias con Dificultad</div>
                <div class="value">${matDificultad}</div>
            </div>
            
            <!-- NUEVO BLOQUE P17 -->
            <div class="field-box" style="margin-bottom:12px; background-color:#eff6ff; padding:8px; border-radius:4px;">
                <div class="label" style="color:#1e3a8a;">MATERIAS PARA NIVELACIÓN / VERANO (YA APROBADAS)</div>
                <div class="value" style="border:none; padding-bottom:0;">${veranoAprob}</div>
            </div>
            <div class="field-box" style="margin-bottom:12px; background-color:#fef2f2; padding:8px; border-radius:4px;">
                <div class="label" style="color:#b91c1c;">MATERIAS PARA NIVELACIÓN / VERANO (REPROBADAS)</div>
                <div class="value" style="border:none; padding-bottom:0;">${veranoReprob}</div>
            </div>

            <div class="grid-2">
                 <div class="field-box">
                    <div class="label">Situación Laboral</div>
                    <div class="value">Trabaja: ${trabaja}</div>
                </div>
                 <div class="field-box">
                    <div class="label">Horas Estudio/Día</div>
                    <div class="value">${horas} Horas</div>
                </div>
            </div>
        </div>

        <!-- Section 3: Malla -->
        <div class="section">
            <div class="section-header">
                <div><span></span> Mapa de Avance Curricular</div>
            </div>
            
            <div class="legend">
                <div class="legend-item"><div class="dot" style="background:#34d399;"></div> Aprobado</div>
                <div class="legend-item"><div class="dot" style="background:#f87171;"></div> Reprobado</div>
                <div class="legend-item"><div class="dot" style="background:#38bdf8;"></div> Levantamiento</div>
                <div class="legend-item"><div class="dot" style="background:#d1d5db;"></div> Pendiente</div>
            </div>

            ${mallaHTML}
        </div>

        <!-- Section 4: Expectativas -->
        <div class="section keep-together">
             <div class="section-header"><span></span> Percepción y Expectativas</div>
             
             <div class="field-box">
                <div class="label">¿Cómo te sientes respecto al nuevo currículo?</div>
                <div class="value">${p11}</div>
             </div>
             
             <div class="grid-2">
                 <div class="field-box">
                    <div class="label">Afectación perceived</div>
                    <div class="value">${p10} ${p10Exp}</div>
                 </div>
                  <div class="field-box">
                    <div class="label">Aporte principal esperado</div>
                    <div class="value">${p12}</div>
                 </div>
             </div>
        </div>

        <!-- Section 5: Medidas -->
        <div class="section keep-together">
             <div class="section-header"><span></span> Medidas de Transición Preferidas</div>
             
             <div class="field-box">
                <div class="label">Medidas seleccionadas</div>
                <div class="value" style="line-height:1.4;">${p13}</div>
             </div>
             
             <div class="field-box" style="margin-top:10px;">
                <div class="label">PRIORIDAD ABSOLUTA</div>
                <div class="value value-highlight">${prioridad}</div>
             </div>
        </div>

        <!-- Section 6: Propuesta -->
        <div class="section keep-together">
             <div class="section-header"><span>¡</span> Tu Propuesta / Comentario Final</div>
             <div class="propuesta-box">
                "${propuesta}"
             </div>
        </div>

        <div class="footer">
            Documento generado automáticamente por el Sistema de Encuestas Curriculares - Psicología UAGRM<br>
            Este reporte es informativo y refleja las respuestas proporcionadas por el estudiante en la fecha indicada.
        </div>
    </body>
    </html>
    `;

    // Configuración PDF mejorada
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right
        filename: `Reporte_Psicologia_${registro}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // Mayor escala para nitidez
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Evitar cortes feos
    };

    console.log('Generando PDF...');

    // Usar Worker si está disponible (html2pdf lo maneja)
    html2pdf().set(opt).from(element).save()
        .then(() => {
            console.log(' PDF Generado con éxito!');
        })
        .catch(err => {
            console.error('Error generando PDF:', err);
            alert('Hubo un error generando el reporte. Por favor intente de nuevo.');
        });
}

// Inicializar
init();

// --- SELECTION MODAL LOGIC (Talleres & Electivas) ---
let currentSelectionCard = null;
const listsData = {
    talleres: [],
    electivas: []
};

async function loadLists() {
    // Load Talleres
    try {
        const responseT = await fetch('talleres.txt');
        if (responseT.ok) {
            const text = await responseT.text();
            listsData.talleres = text.split('\n').map(l => l.trim()).filter(l => l);
        }
    } catch (e) {
        console.warn("Error cargando talleres.txt", e);
    }

    // Load Electivas
    try {
        const responseE = await fetch('electivas.txt');
        if (responseE.ok) {
            const text = await responseE.text();
            listsData.electivas = text.split('\n').map(l => l.trim()).filter(l => l);
        }
    } catch (e) {
        console.warn("Error cargando electivas.txt", e);
    }
}

function openSelectionModal(card) {
    currentSelectionCard = card;
    const modal = document.getElementById('talleres-modal');
    const title = modal.querySelector('h3');
    const p = modal.querySelector('p');
    const select = document.getElementById('taller-select');

    // Determine type
    const isTaller = card.id.startsWith('taller-');
    const list = isTaller ? listsData.talleres : listsData.electivas;

    // Update UI text
    if (isTaller) {
        title.innerHTML = '<i class="fas fa-chalkboard-teacher text-blue-900"></i> Seleccionar Taller';
        p.textContent = 'Elige el taller que cursaste:';
    } else {
        title.innerHTML = '<i class="fas fa-book-open text-blue-900"></i> Seleccionar Electiva';
        p.textContent = 'Elige la electiva que cursaste:';
    }

    // Populate Select
    select.innerHTML = '<option value="">-- Selecciona una opción --</option>';
    list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });

    // Reset Input
    const input = document.getElementById('custom-selection-input');
    input.classList.add('hidden');
    input.value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Pre-select if already selected
    if (card.dataset.customSelection) {
        // Check if value is in list
        const isInList = list.includes(card.dataset.customSelection);
        if (isInList) {
            select.value = card.dataset.customSelection;
        } else {
            // If not in list, it's likely a custom typed value (or legacy/Other)
            // We try to find the "Other" option to select it
            const otherOption = Array.from(select.options).find(o => o.text.toLowerCase().includes('otro') || o.text.toLowerCase().includes('otra'));
            if (otherOption) {
                select.value = otherOption.value;
                toggleCustomInput(select); // Show input
                input.value = card.dataset.customSelection; // Fill input
            } else {
                // Fallback
                select.value = "";
            }
        }
    } else if (card.dataset.selectedWorkshop) { // Legacy support
        select.value = card.dataset.selectedWorkshop;
    } else {
        select.value = "";
    }
}

function closeTalleresModal() {
    const modal = document.getElementById('talleres-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentSelectionCard = null;
}

function saveTallerSelection() {
    if (!currentSelectionCard) return;

    const select = document.getElementById('taller-select');
    const input = document.getElementById('custom-selection-input');

    let selectedValue = select.value;

    // Si el input está visible, usaremos su valor
    if (!input.classList.contains('hidden') && input.value.trim() !== "") {
        selectedValue = input.value.trim();
    }

    if (selectedValue) {
        // Guardar seleccion
        currentSelectionCard.dataset.customSelection = selectedValue;
        currentSelectionCard.dataset.status = 'aprobado';

        // Actualizar UI
        const originalTitle = currentSelectionCard.dataset.originalName;
        currentSelectionCard.innerHTML = `<div class="font-bold pointer-events-none">${originalTitle}</div><div class="text-[10px] leading-tight mt-1 text-blue-800 font-normal pointer-events-none">${selectedValue}</div>`;

        currentSelectionCard.classList.remove('items-center');
        currentSelectionCard.classList.add('flex-col', 'justify-center');

        updateCardStyle(currentSelectionCard, 'aprobado');
    } else {
        // Limpia la selección
        currentSelectionCard.removeAttribute('data-custom-selection');
        currentSelectionCard.removeAttribute('data-selected-workshop');
        currentSelectionCard.dataset.status = 'pendiente';
        currentSelectionCard.innerText = currentSelectionCard.dataset.originalName;
        currentSelectionCard.classList.add('items-center');
        currentSelectionCard.classList.remove('flex-col', 'justify-center');
        updateCardStyle(currentSelectionCard, 'pendiente');
    }

    saveData();
    closeTalleresModal();
    updateProgress();
}

// --- HELPER FOR CUSTOM INPUT ---
function toggleCustomInput(select) {
    const input = document.getElementById('custom-selection-input');
    // Check if the selected text implies "Other"
    const text = select.options[select.selectedIndex].text.toLowerCase();

    if (text.includes('otro') || text.includes('otra')) {
        input.classList.remove('hidden');
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = ''; // Clean up
    }
}
