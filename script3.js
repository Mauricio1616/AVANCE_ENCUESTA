// script3.js - Lógica para "Casos Especiales" V5 (Estadísticas)

let cachedSpecialCasesList = null;

// Helper Fecha
const formatTimestamp = (ts) => {
    if (!ts) return '-';
    let d;
    if (ts.seconds !== undefined && ts.nanoseconds !== undefined) {
        d = new Date(ts.seconds * 1000);
    } else if (ts.toDate && typeof ts.toDate === 'function') {
        d = ts.toDate();
    } else if (ts instanceof Date) {
        d = ts;
    } else if (typeof ts === 'number' || typeof ts === 'string') {
        d = new Date(ts);
    } else {
        return '-';
    }

    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// 1. Análisis de Datos
const analyzeSpecialCases = () => {
    console.log("🔍 Recalculando Casos Especiales y Estadísticas...");
    const surveys = window.allSurveys || [];
    const results = [];

    // Contadores
    let countTotal = 0;
    let countLow = 0;   // 1-6
    let countHigh = 0;  // 7-10
    let countMixed = 0; // Ambos

    // Helper semestres
    const parseSemStr = (str) => {
        if (!str) return 0;
        const map = { "1er": 1, "2do": 2, "3er": 3, "4to": 4, "5to": 5, "6to": 6, "7mo": 7, "8vo": 8, "9no": 9, "10mo": 10 };
        const prefix = str.split(' ')[0];
        return map[prefix] || 0;
    };

    surveys.forEach(student => {
        const malla = student.malla || [];
        const personal = student.personal || {};

        let semestresSeleccionados = Array.isArray(personal.semestre) ? personal.semestre : [personal.semestre];
        let maxSemestre = 0;
        semestresSeleccionados.forEach(s => {
            const val = parseSemStr(s);
            if (val > maxSemestre) maxSemestre = val;
        });
        if (maxSemestre === 0) maxSemestre = 10;

        const semesterStatus = {};

        malla.forEach(subj => {
            if (!subj.id) return;
            let level = -1;
            if (subj.id.startsWith('sem-')) {
                const parts = subj.id.split('-');
                if (parts.length >= 2 && !isNaN(parts[1])) level = parseInt(parts[1]) + 1;
            } else if (subj.id.includes('mod9') || subj.id.includes('sem-8')) level = 9;
            else if (subj.id.includes('mod10') || subj.id.includes('sem-9')) level = 10;

            if (level === -1 || level > 10) return;

            if (!semesterStatus[level]) semesterStatus[level] = { touches: 0, approved: 0, total: 0, failures: 0, debts: [] };

            const st = semesterStatus[level];
            st.total++;
            const estado = subj.estado || 'pendiente';

            if (estado !== 'pendiente') st.touches++;

            if (estado === 'aprobado' || estado === 'convalidado') {
                st.approved++;
            } else if (estado === 'reprobado' || estado === 'abandono') {
                st.failures++;
                st.debts.push({ name: subj.nombre, status: estado });
            } else {
                st.debts.push({ name: subj.nombre, status: estado });
            }
        });

        // Filtrar Deudas Activas
        const activeDebtSemesters = [];
        const debtDetailsMap = {};

        for (const [lvlStr, st] of Object.entries(semesterStatus)) {
            const level = parseInt(lvlStr);
            if (st.touches === 0) continue;
            if (st.approved === st.total) continue;

            activeDebtSemesters.push(level);

            debtDetailsMap[level] = st.debts.map(d => {
                let icon = '⭕';
                if (d.status === 'reprobado') icon = '🔴';
                if (d.status === 'abandono') icon = '⚫';
                return { name: d.name, icon, status: d.status };
            });
        }

        if (activeDebtSemesters.length >= 2) {
            // CLASIFICACIÓN ESTADÍSTICA
            countTotal++;
            const hasLow = activeDebtSemesters.some(s => s <= 6);
            const hasHigh = activeDebtSemesters.some(s => s >= 7);

            if (hasLow && hasHigh) {
                countMixed++;
            } else if (hasLow) {
                countLow++;
            } else if (hasHigh) {
                countHigh++;
            }

            const sortedSems = activeDebtSemesters.sort((a, b) => a - b);

            const summaryHTML = sortedSems.map(sem => {
                const subjects = debtDetailsMap[sem];
                const listHTML = subjects.map(s => `<span class="whitespace-nowrap">${s.icon} ${s.name}</span>`).join(', ');
                return `
                    <div class="mb-2 p-1.5 bg-red-50/50 border border-red-100 rounded text-xs break-inside-avoid">
                        <div class="font-bold text-red-800 uppercase mb-1 border-b border-red-200 pb-0.5 flex justify-between">
                            <span>Semestre ${sem}</span>
                            <span class="text-[10px] bg-white px-1 rounded border border-red-100 text-red-400">${subjects.length} pendientes</span>
                        </div>
                        <div class="text-slate-600 leading-snug flex flex-wrap gap-x-2 gap-y-1">
                            ${listHTML}
                        </div>
                    </div>
                `;
            }).join('');

            results.push({
                studentId: student.id,
                studentObj: student,
                nombre: (personal.nombre || '') + ' ' + (personal.apellidos || ''),
                registro: personal.registro || '',
                fecha: formatTimestamp(student.timestamp),
                rawTimestamp: student.timestamp,
                currentSem: semestresSeleccionados.join(', '),
                summaryHTML: summaryHTML,
                excelDetails: sortedSems.map(sem => {
                    const subs = debtDetailsMap[sem].map(s => `${s.name} (${s.status})`).join(', ');
                    return `SEM ${sem}: ${subs}`;
                }).join(' || ')
            });
        }
    });

    cachedSpecialCasesList = results;

    // Actualizar Contadores DOM
    document.getElementById('stat-total').textContent = countTotal;
    document.getElementById('stat-low').textContent = countLow;
    document.getElementById('stat-high').textContent = countHigh;
    document.getElementById('stat-mixed').textContent = countMixed;
};

// 2. Renderizado / Actualización de Vista
window.updateSpecialCasesView = () => {
    const container = document.getElementById('special-cases-list');
    if (!container || !cachedSpecialCasesList) return;

    const searchTerm = document.getElementById('special-search')?.value.toLowerCase() || '';

    const filtered = cachedSpecialCasesList.filter(item => {
        return item.nombre.toLowerCase().includes(searchTerm) ||
            item.registro.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        if (cachedSpecialCasesList.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-400">
                <div class="inline-block p-4 rounded-full bg-slate-50 mb-3"><i class="fas fa-check text-2xl text-green-500"></i></div>
                <p>No se encontraron casos críticos.</p>
            </td></tr>`;
        } else {
            container.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-400">
                <p>No hay coincidencias para tu búsqueda.</p>
            </td></tr>`;
        }
        return;
    }

    container.innerHTML = filtered.map(item => {
        const semDisplay = window.formatListAsBadges ? window.formatListAsBadges(item.currentSem) : item.currentSem;

        return `
            <tr class="hover:bg-amber-50/40 border-b border-slate-100 transition-colors group">
                <td class="p-4 align-top w-28 text-sm text-slate-600">
                    ${item.fecha}
                </td>
                <td class="p-4 align-top w-1/4">
                    <div class="font-bold text-slate-800 text-base">${item.nombre}</div>
                    <div class="text-xs text-slate-400 font-mono mt-0.5">${item.registro}</div>
                </td>
                <td class="p-4 align-top w-24">
                    ${semDisplay}
                </td>
                <td class="p-4 align-top">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${item.summaryHTML}
                    </div>
                </td>
                <td class="p-4 align-top text-right w-24">
                     <div class="flex flex-col gap-2">
                        <button onclick="openStudentDetail(${JSON.stringify(item.studentObj).replace(/"/g, '&quot;')})" 
                                class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 transition-colors text-center w-full shadow-sm">
                            <i class="fas fa-id-card mr-1"></i> Ficha
                        </button>
                         <button onclick="downloadStudentPDF('${item.studentId}')" 
                                class="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100 transition-colors text-center w-full shadow-sm">
                            <i class="fas fa-download mr-1"></i> PDF
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

window.renderSpecialCases = () => {
    analyzeSpecialCases();
    updateSpecialCasesView();
};

window.downloadSpecialCasesExcel = () => {
    if (!cachedSpecialCasesList || cachedSpecialCasesList.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const searchTerm = document.getElementById('special-search')?.value.toLowerCase() || '';
    const dataToExport = cachedSpecialCasesList.filter(item => {
        return item.nombre.toLowerCase().includes(searchTerm) ||
            item.registro.toLowerCase().includes(searchTerm);
    });

    if (dataToExport.length === 0) {
        alert("No hay datos visibles para exportar.");
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "Nombre;Registro;Fecha;Semestre Actual;Detalle Deudas\n";

    dataToExport.forEach(item => {
        const fila = [
            `"${item.nombre}"`,
            `"${item.registro}"`,
            `"${item.fecha}"`,
            `"${item.currentSem}"`,
            `"${item.excelDetails}"`
        ].join(";");
        csvContent += fila + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Casos_Especiales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
