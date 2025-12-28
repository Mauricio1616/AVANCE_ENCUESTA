// Web Worker para procesar registros en paralelo (sin bloquear UI)
self.onmessage = function(e) {
    if (e.data.action === 'cargarRegistros') {
        const texto = e.data.texto;
        const inicio = performance.now();
        
        // Procesar registros de forma ultra-rápida
        const registros = [];
        const lineas = texto.split('\n');
        
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea && /^\d+$/.test(linea)) {
                registros.push(linea);
            }
        }
        
        const tiempo = (performance.now() - inicio).toFixed(2);
        
        // Enviar resultado al hilo principal
        self.postMessage({
            success: true,
            cantidad: registros.length,
            registros: registros,
            tiempo: tiempo
        });
    }
};
