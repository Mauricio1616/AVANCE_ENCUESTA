
// Función para descargar PDF individual de un estudiante (FORMATO COMPLETO)
window.downloadStudentPDF = (studentId) => {
    console.log('📄 INICIANDO DESCARGA DE PDF para:', studentId);

    // 1. Determinar fuente de datos: ¿Nueva encuesta o Datos cargados de Firebase?
    let allData;

    // Intentar obtener 'allSurveys' del alcance global (definido en 360_Panel_Administracion.html)
    const surveys = window.allSurveys || undefined;

    if (surveys && surveys.length > 0 && typeof studentId === 'string') {
        console.log(' Usando datos existentes cargados desde Firebase (Admin Panel)');
        allData = surveys.find(s => s.id === studentId);
        if (!allData) {
            alert('Error: No se encontró el estudiante con ID ' + studentId);
            return;
        }
    } else if (window.existingSurveyData) {
        console.log(' Usando datos existentes (existingSurveyData)');
        allData = window.existingSurveyData;
    } else {
        console.log(' Usando datos de la sesión actual (capturarTodosDatos)');
        if (typeof capturarTodosDatos === 'function') {
            allData = capturarTodosDatos();
        } else {
            console.error("No se puede determinar la fuente de datos.");
            alert("Error: No hay datos cargados (allSurveys vacío) y no estás en la encuesta.");
            return;
        }
    }


    const student = allData;

    // DEFINIFICIÓN DE DATOS ESTATICOS (Copiados de script.js para independencia)
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

    const data = student.personal || {};
    const malla = student.malla || [];
    const seccion2_cierre = student.seccion2_cierre || {};
    const seccion3 = student.seccion3 || {};
    const seccion4 = student.seccion4 || {};
    const seccion5 = student.seccion5 || {};

    const nombre = data.nombre || '-';
    const apellidos = data.apellidos || '-';
    const registro = data.registro || '-';
    // const ci = data.CI || '-'; // Corrección de mayúsculas si es necesario
    const ci = getField(student, 'CI', 'ci') || '-';
    const celular = data.celular || '-';
    const correo = data.correo || '-';

    // Helper si getField no está en scope (en script separado idealmente sí, pero por si acaso usamos acceso directo seguro)
    // Pero en admin panel getField es global.

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

    // Preparar columnas
    const columns = {};
    for (let i = 0; i <= 10; i++) columns[i] = [];

    // Detectar modalidad del usuario para semestres 9 y 10
    let userModality = 'humanista'; // Default
    const modalityMatch = malla.find(m => m.id && m.id.includes('mod9-'));
    if (modalityMatch) {
        const parts = modalityMatch.id.split('-');
        if (parts.length >= 2) userModality = parts[1];
    }
    console.log("Modalidad detectada para PDF:", userModality);

    // Llenar columnas con datos ESTÁTICOS
    // Semestres 1-8
    for (let i = 0; i <= 7; i++) {
        const semInfo = semesterData[i];
        if (semInfo && semInfo.subjects) {
            semInfo.subjects.forEach((subjName, idx) => {
                columns[i].push({ id: `sem-${i}-${idx}`, nombre: subjName, estado: 'pendiente' });
            });
        }
    }

    // Semestres 9-10
    const abordaje = abordajesData[userModality] || abordajesData['humanista'];

    // S9
    if (semesterData[8]?.subjects) semesterData[8].subjects.forEach((s, i) => columns[8].push({ id: `sem-8-${i}`, nombre: s, estado: 'pendiente' }));
    if (abordaje?.sem9) abordaje.sem9.forEach((s, i) => columns[8].push({ id: `mod9-${userModality}-${i}`, nombre: s.name, estado: 'pendiente' }));

    // S10
    if (semesterData[9]?.subjects) semesterData[9].subjects.forEach((s, i) => columns[9].push({ id: `sem-9-${i}`, nombre: s, estado: 'pendiente' }));
    if (abordaje?.sem10) abordaje.sem10.forEach((s, i) => columns[9].push({ id: `mod10-${userModality}-${i}`, nombre: s.name, estado: 'pendiente' }));

    // Electivas y Talleres
    electivasData.forEach((s, i) => columns[10].push({ id: `elec-${i}`, nombre: s, estado: 'pendiente' }));
    talleresData.forEach((s, i) => columns[10].push({ id: `taller-${i}`, nombre: s, estado: 'pendiente' }));


    // SOBRESCRIBIR con el estado real del usuario
    malla.forEach(userSubj => {
        if (!userSubj.id) return;
        for (let c = 0; c <= 10; c++) {
            const match = columns[c].find(s => s.id === userSubj.id);
            if (match) {
                match.estado = userSubj.estado;
                break;
            }
        }
    });

    // GENERAR HTML (Visualización)
    const stylesMap = {
        aprobado: { bg: '#dcfce7', text: '#14532d', border: '#86efac', icon: '' },
        reprobado: { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5', icon: '' },
        levantamiento: { bg: '#e0f2fe', text: '#0c4a6e', border: '#7dd3fc', icon: '' },
        pendiente: { bg: '#ffffff', text: '#94a3b8', border: '#e2e8f0', icon: '' }
    };

    let mallaHTML = `<div style="display: flex; gap: 4px; overflow-x: visible; width: 100%; justify-content: space-between;">`;

    for (let i = 0; i <= 10; i++) {
        if (i === 10 && columns[i].length === 0) continue;
        let semTitle = (i < 10) ? `${i + 1}º` : "E/T";

        mallaHTML += `<div style="display: flex; flex-direction: column; gap: 3px; width: 8.5%; min-width: 45px;">
            <div style="text-align: center; font-size: 8px; font-weight: bold; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-bottom: 2px;">${semTitle}</div>`;

        columns[i].forEach(m => {
            const st = stylesMap[m.estado] || stylesMap.pendiente;

            let displayName = m.nombre;
            const userSubj = malla.find(u => u.id === m.id);
            if (userSubj && userSubj.customSelection) displayName = userSubj.customSelection;

            let shortName = displayName.length > 25 ? displayName.substring(0, 23) + '..' : displayName;
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
                min-height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                word-break: break-all;
                position: relative; 
            " title="${displayName} (${m.estado})">
                ${shortName}
                ${st.icon ? `<div style="position: absolute; top: 0px; right: 1px; font-size: 6px; opacity: 0.7;">${st.icon}</div>` : ''}
            </div>`;
        });

        if (columns[i].length === 0) mallaHTML += `<div style="text-align:center; color:#cbd5e1; font-size:7px; font-style:italic; padding-top:5px;">-</div>`;
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

    // Usar Worker si está disponible
    html2pdf().set(opt).from(element).save()
        .then(() => {
            console.log(' PDF Generado con éxito!');
        })
        .catch(err => {
            console.error('Error generando PDF:', err);
            alert('Hubo un error generando el reporte. Por favor intente de nuevo.');
        });
};

// Función para descargar la HOJA DE RUTA (Roadmap) desde el Admin Panel
window.downloadRoadmapPDF = (studentId) => {
    console.log('🗺️ Generando Hoja de Ruta para:', studentId);

    // 1. Buscar estudiante en allSurveys
    const surveys = window.allSurveys || [];
    const student = surveys.find(s => s.id === studentId);

    if (!student) {
        alert('Error: No se encontró el estudiante con ID ' + studentId);
        return;
    }

    const personal = student.personal || student; // Fallback si está plano
    const malla = student.malla || [];

    // 2. Lógica idéntica a index.html (generateBlankPDF)

    // Set de materias aprobadas para búsqueda rápida
    const aprobadasSet = new Set();
    malla.forEach(m => {
        if (m.estado === 'aprobado' || m.estado === 'convalidado') {
            aprobadasSet.add(m.nombre.trim().toLowerCase());
        }
    });

    // Datos de la malla (Copia local)
    const localSemesterData = [
        { id: "s1", title: "1er Semestre", subjects: ["Filosofía", "Estadística I", "Sociología I", "Antropología Cultural", "Psicología I", "Biopsicología", "Estrategias de Aprendizaje"] },
        { id: "s2", title: "2do Semestre", subjects: ["Epistemología", "Estadística II", "Sociología II", "Antropología Cultural Boliviana", "Psicología II", "Psicofisiología"] },
        { id: "s3", title: "3er Semestre", subjects: ["Investigación I", "Psicología Social", "Psicología Etnoecológica", "Desarrollo Humano I", "Teorías y Sistemas I", "Neuropsicología I", "Aprendizaje"] },
        { id: "s4", title: "4to Semestre", subjects: ["Investigación II", "Psicología Grupal y Organizacional", "Desarrollo Humano II", "Teorías y Sistemas II", "Neuropsicología II", "Etología"] },
        { id: "s5", title: "5to Semestre", subjects: ["Investigación III", "Comportamiento y Sociedad", "Psicología de la Personalidad I", "Evaluación Psicológica I", "Psicopatología I", "Psicología Cognitiva I"] },
        { id: "s6", title: "6to Semestre", subjects: ["Investigación IV", "Diagnóstico de Necesidades", "Psicología de la Personalidad II", "Evaluación Psicológica II", "Psicopatología II", "Psicoanálisis", "Psicología Cognitiva II"] },
        { id: "s7", title: "7mo Semestre", subjects: ["Investigación V", "Proyectos I", "Tec. de Int. Socio - Organizacional I", "Técnicas Proyectivas", "Tec. de Int. Clínica I", "Tec. de Int. Educativa I"] },
        { id: "s8", title: "8vo Semestre", subjects: ["Investigación VI", "Proyectos II", "Tec. de Int. Socio - Organizacional II", "Psicodiagnóstico", "Tec. de Int. Clínica II", "Tec. de Int. Educativa II"] },
        { id: "s9", title: "9no Semestre", subjects: ["Ética Profesional I"] }, // Se llenará dinámicamente
        { id: "s10", title: "10mo Semestre", subjects: ["Ética Profesional II"] } // Se llenará dinámicamente
    ];

    // Detectar modalidad si existe, o usar Humanista por defecto
    const modality = personal.modalidad_graduacion || 'humanista';

    // Datos de abordajes
    const abordajesDataLocal = {
        humanista: { sem9: ["Abordaje Clínico I", "Abordaje Educativo I", "Abordaje Socio Organizacional I"], sem10: ["Abordaje Clínico II", "Abordaje Educativo II", "Abordaje Socio Organizacional II"] },
        cognitivo: { sem9: ["Abordaje Clínico I", "Abordaje Educativo I", "Abordaje Socio Organizacional I"], sem10: ["Abordaje Clínico II", "Abordaje Educativo II", "Abordaje Socio Organizacional II"] },
        ambiental: { sem9: ["Psicología Ambiental I", "Psicología Comunitaria I", "Psicología de las Organizaciones I"], sem10: ["Psicología Ambiental II", "Psicología Comunitaria II", "Psicología de las Organizaciones II"] },
        psicoanalitico: { sem9: ["Abordaje Clínico I", "Abordaje Educativo I", "Abordaje Socio Organizacional I"], sem10: ["Abordaje Clínico II", "Abordaje Educativo II", "Abordaje Socio Organizacional II"] }
    };

    const selectedAbordaje = abordajesDataLocal[modality] || abordajesDataLocal['humanista'];

    // Agregar materias de abordaje a S9 y S10
    localSemesterData[8].subjects.push(...selectedAbordaje.sem9);
    localSemesterData[9].subjects.push(...selectedAbordaje.sem10);

    // Construcción del filas de la tabla
    let tableRows = '';
    let totalAprobadas = 0;
    let totalFaltantesNivelacion = 0;
    let totalMaterias = 0;

    localSemesterData.forEach((sem, index) => {
        const semesterNum = index + 1;
        const isNivelacion = semesterNum <= 6;

        // Estilos para la etiqueta del semestre
        let semLabelStyle = isNivelacion
            ? "background-color: #dbeafe; color: #1e3a8a; font-weight: bold; border-right: 2px solid #3b82f6;"
            : "background-color: #f1f5f9; color: #334155; font-weight: bold;";

        let rowCells = `<td style="padding: 4px; border: 1px solid #cbd5e1; width: 80px; text-align: center; font-size: 10px; ${semLabelStyle}">${sem.title}</td>`;

        // Celdas de materias
        sem.subjects.forEach(subject => {
            totalMaterias++;
            const isApproved = aprobadasSet.has(subject.trim().toLowerCase());

            let cellStyle = "padding: 2px; border: 1px solid #cbd5e1; font-size: 9px; line-height: 1.1; text-align: center; vertical-align: middle; height: 35px; width: 85px; overflow: hidden;";

            if (isApproved) {
                // Aprobado: Verde
                cellStyle += "background-color: #bbf7d0; color: #14532d; font-weight: bold; border-color: #4ade80;";
                totalAprobadas++;
            } else if (isNivelacion) {
                // Pendiente en Nivelación (S1-S6): Rojo
                cellStyle += "background-color: #fee2e2; color: #991b1b; font-weight: bold; border-color: #fca5a5;";
                totalFaltantesNivelacion++;
            } else {
                // Pendiente en Ciclo Superior: Gris/Blanco
                cellStyle += "background-color: #f8fafc; color: #64748b;";
            }

            rowCells += `
                <td style="${cellStyle}">
                    ${subject}
                </td>
            `;
        });

        // Rellenar celdas vacías
        const maxCols = 7;
        for (let i = sem.subjects.length; i < maxCols; i++) {
            rowCells += `<td style="padding: 2px; border: 1px solid #f1f5f9; background-color: #f8fafc;"></td>`;
        }

        tableRows += `<tr>${rowCells}</tr>`;

        // Separador visual después del semestre 6
        if (semesterNum === 6) {
            tableRows += `<tr style="background-color: #1e3a8a; color: white;"><td colspan="${maxCols + 1}" style="padding: 1px; text-align: center; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;"></td></tr>`;
        }
    });

    // --- LÓGICA DE PROYECCIÓN / REGULARIZACIÓN ---
    // 1. Aplanar lista de materias pendientes ordenadas por semestre
    let allPending = [];
    localSemesterData.forEach((sem, idx) => {
        sem.subjects.forEach(subjName => {
            const cleanName = subjName.trim().toLowerCase();
            if (!aprobadasSet.has(cleanName)) {
                allPending.push({ name: subjName, semester: idx + 1 });
            }
        });
    });

    // 2. Generar sugerencia (Top 7 para G1, Siguientes 7 para G2)
    // Asumimos carga máxima de 7 materias para regularizar
    const maxSubjects = 7;
    const planG1 = allPending.slice(0, maxSubjects);
    const planG2 = allPending.slice(maxSubjects, maxSubjects * 2);

    // Helper HTML lista
    const renderPlanList = (list) => {
        if (list.length === 0) return '<div style="font-style:italic; color:#94a3b8;">¡Al día! Sin materias pendientes.</div>';
        return list.map(item => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 2px 0;">
                <span>${item.name}</span>
                <span style="font-size: 8px; background: #f1f5f9; padding: 1px 4px; border-radius: 4px; color: #64748b;">Sem ${item.semester}</span>
            </div>
        `).join('');
    };


    // Elemento Contenedor para PDF
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 20px; font-family: 'Helvetica', sans-serif; height: 100%; width: 100%; background: white;">
            
            <!-- Encabezado -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 20px;">
                <div>
                    <h1 style="color: #1e3a8a; margin: 0; font-size: 18px; text-transform: uppercase;">Hoja de Ruta Académica</h1>
                    <p style="color: #64748b; font-size: 12px; margin: 2px 0;">Psicología UAGRM - Plan Nivelación - ${personal.registro || student.id}</p>
                </div>
                <div style="text-align: right; font-size: 10px; color: #475569;">
                    <p style="margin: 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <!-- Datos Estudiante -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 15px;">
                <h2 style="font-size: 12px; color: #1e40af; margin: 0 0 5px 0; text-transform: uppercase;">Datos del Estudiante</h2>
                <div style="display: flex; gap: 20px; font-size: 10px; color: #334155;">
                    <div><strong>Nombre:</strong> ${personal.nombre} ${personal.apellidos || ''}</div>
                    <div><strong>CI:</strong> ${personal.CI || (personal.ci || '-')}</div>
                    <div><strong>Celular:</strong> ${personal.celular || '-'}</div>
                    <div><strong>Modalidad:</strong> ${modality.toUpperCase()}</div>
                </div>
            </div>

            <!-- Leyenda -->
            <div style="margin-bottom: 10px; display: flex; gap: 15px; font-size: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="width: 8px; height: 8px; background: #bbf7d0; border: 1px solid #4ade80;"></span>
                    <span>Materia Aprobada</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="width: 8px; height: 8px; background: #fee2e2; border: 1px solid #f87171;"></span>
                    <span>Pendiente (Nivelación - Prioridad)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="width: 8px; height: 8px; background: #f8fafc; border: 1px solid #cbd5e1;"></span>
                    <span>Pendiente</span>
                </div>
            </div>

            <!-- Tabla Malla -->
            <table style="width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 15px;">
                ${tableRows}
            </table>

            <!-- Resumen Créditos -->
            <div style="background: #eff6ff; border-left: 3px solid #3b82f6; padding: 8px; font-size: 10px; display: flex; justify-content: space-around; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <span style="display: block; font-weight: bold; color: #1e3a8a; font-size: 14px;">${totalAprobadas}</span>
                    <span style="color: #64748b;">Materias Vencidas</span>
                </div>
                <div style="text-align: center;">
                    <span style="display: block; font-weight: bold; color: #dc2626; font-size: 14px;">${totalFaltantesNivelacion}</span>
                    <span style="color: #dc2626;">Faltantes Nivelación (S1-S6)</span>
                </div>
                <div style="text-align: center;">
                    <span style="display: block; font-weight: bold; color: #475569; font-size: 14px;">${totalMaterias}</span>
                    <span style="color: #64748b;">Total Materias</span>
                </div>
            </div>

            <!-- PLAN DE REGULARIZACION -->
            <div style="margin-top: 10px; page-break-inside: avoid;">
                <h3 style="font-size: 12px; color: #be123c; text-transform: uppercase; border-bottom: 1px solid #fecdd3; padding-bottom: 5px; margin-bottom: 10px;">
                    📅 Plan Sugerido de Regularización (Nivelación)
                </h3>
                
                <div style="display: flex; gap: 20px;">
                    <!-- Gestion 1 -->
                    <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                        <div style="background: #f1f5f9; padding: 5px 10px; font-weight: bold; color: #475569; font-size: 10px; border-bottom: 1px solid #e2e8f0;">
                            GESTION 1 / 2026
                        </div>
                        <div style="padding: 10px; font-size: 9px; line-height: 1.4; color: #334155;">
                            ${renderPlanList(planG1)}
                        </div>
                    </div>

                    <!-- Gestion 2 -->
                    <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                        <div style="background: #f1f5f9; padding: 5px 10px; font-weight: bold; color: #475569; font-size: 10px; border-bottom: 1px solid #e2e8f0;">
                            GESTION 2 / 2026
                        </div>
                        <div style="padding: 10px; font-size: 9px; line-height: 1.4; color: #334155;">
                             ${renderPlanList(planG2)}
                        </div>
                    </div>
                </div>
                <p style="margin-top: 8px; font-size: 8px; color: #94a3b8; font-style: italic;">
                    * Este plan es una sugerencia automática basada en priorizar las materias de semestres inferiores pendientes (arrastres). 
                    No verifica choques de horarios ni correquisitos específicos de la nueva malla.
                </p>
            </div>

            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; pt-2 text-center text-[8px] text-slate-400">
                Documento generado automáticamente por sistema Psiconet 360 - Dirección de Carrera.
            </div>
        </div>
    `;

    // Configuración PDF
    const opt = {
        margin: 0.3,
        filename: `Hoja_Ruta_${personal.registro || 'student'}_Regularizacion.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'legal', orientation: 'landscape' }
    };

    // Generar
    html2pdf().set(opt).from(element).save();
};
