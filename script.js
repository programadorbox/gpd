let seleccionadosMap = new Map(); // Guarda ID -> { hospPorc, hospTope, ambPorc, ambTope }

document.addEventListener("DOMContentLoaded", () => {
    // 1. Asignar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fechaPropuesta").value = hoy;
    document.getElementById("lblFecha").innerText = hoy.split('-').reverse().join('/');

    // 2. Renderizar la tabla inicial
    renderizarTablaPrestadores(prestadoresData);

    // 3. Configurar buscador en tiempo real
    document.getElementById("buscadorPrestador").addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase();
        const filtrados = prestadoresData.filter(p => 
            p.prestador.toLowerCase().includes(texto) || 
            p.ubicacion.toLowerCase().includes(texto)
        );
        renderizarTablaPrestadores(filtrados);
    });
});

function renderizarTablaPrestadores(lista) {
    const tbody = document.getElementById("tablaPrestadoresBody");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No se encontraron prestadores</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const estaAgregado = seleccionadosMap.has(p.id);
        const datos = seleccionadosMap.get(p.id) || { hospPorc: "100", hospTope: "S/T", ambPorc: "80", ambTope: "S/T" };
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-center">
                <button class="btn btn-sm ${estaAgregado ? 'btn-success' : 'btn-outline-primary'}" 
                        onclick="togglePrestador(${p.id})">
                    <i class="fa-solid ${estaAgregado ? 'fa-check' : 'fa-plus'}"></i> ${estaAgregado ? 'Agregado' : 'Agregar'}
                </button>
            </td>
            <td class="fw-semibold">${p.prestador}</td>
            <td><span class="badge bg-secondary">${p.ubicacion}</span></td>
            <td class="text-center">
                <div class="input-group input-group-sm mb-1">
                    <input type="number" min="0" max="100" class="form-control text-center" id="hospPorc_${p.id}" value="${datos.hospPorc}" placeholder="100">
                    <span class="input-group-text bg-light fw-bold">%</span>
                </div>
                <select class="form-select form-select-sm" id="hospTope_${p.id}">
                    <option value="S/T" ${datos.hospTope === 'S/T' ? 'selected' : ''}>Sin Tope</option>
                    <option value="C/T" ${datos.hospTope === 'C/T' ? 'selected' : ''}>Con Tope</option>
                </select>
            </td>
            <td class="text-center">
                <div class="input-group input-group-sm mb-1">
                    <input type="number" min="0" max="100" class="form-control text-center" id="ambPorc_${p.id}" value="${datos.ambPorc}" placeholder="80">
                    <span class="input-group-text bg-light fw-bold">%</span>
                </div>
                <select class="form-select form-select-sm" id="ambTope_${p.id}">
                    <option value="S/T" ${datos.ambTope === 'S/T' ? 'selected' : ''}>Sin Tope</option>
                    <option value="C/T" ${datos.ambTope === 'C/T' ? 'selected' : ''}>Con Tope</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function togglePrestador(id) {
    // Capturar valores actuales de los inputs numéricos y selectores de esa fila
    const hospInput = document.getElementById(`hospPorc_${id}`).value.trim();
    const hospPorc = (hospInput !== "" ? hospInput : "100") + "%";
    const hospTope = document.getElementById(`hospTope_${id}`).value;

    const ambInput = document.getElementById(`ambPorc_${id}`).value.trim();
    const ambPorc = (ambInput !== "" ? ambInput : "80") + "%";
    const ambTope = document.getElementById(`ambTope_${id}`).value;

    if (seleccionadosMap.has(id)) {
        seleccionadosMap.delete(id);
    } else {
        seleccionadosMap.set(id, { hospPorc, hospTope, ambPorc, ambTope });
    }

    const texto = document.getElementById("buscadorPrestador").value.toLowerCase();
    const filtrados = prestadoresData.filter(p => 
        p.prestador.toLowerCase().includes(texto) || 
        p.ubicacion.toLowerCase().includes(texto)
    );
    renderizarTablaPrestadores(filtrados);
}

function generarPropuesta() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const valor = document.getElementById("valorPlan").value.trim();

    if (!nombre) {
        alert("Por favor, ingresa el nombre de la persona o cliente.");
        document.getElementById("nombreCliente").focus();
        return;
    }

    if (!valor) {
        alert("Por favor, ingresa el valor total del plan en UF.");
        document.getElementById("valorPlan").focus();
        return;
    }

    if (seleccionadosMap.size === 0) {
        alert("Selecciona y configura al menos un prestador para el plan.");
        return;
    }

    // Actualizar textos en la vista final
    document.getElementById("lblNombreCliente").innerText = nombre;
    document.getElementById("lblValorPlan").innerText = valor.toUpperCase().includes("UF") ? valor : valor + " UF";

    const fechaInput = document.getElementById("fechaPropuesta").value;
    if (fechaInput) {
        document.getElementById("lblFecha").innerText = fechaInput.split('-').reverse().join('/');
    }

    // Llenar tabla de seleccionados traduciendo C/T y S/T a texto amigable
    const tbodySel = document.getElementById("tablaSeleccionadosBody");
    tbodySel.innerHTML = "";

    seleccionadosMap.forEach((datos, id) => {
        const p = prestadoresData.find(item => item.id === id);
        if (p) {
            const hospTextoTope = datos.hospTope === 'S/T' ? 'Sin Tope' : 'Con Tope';
            const ambTextoTope = datos.ambTope === 'S/T' ? 'Sin Tope' : 'Con Tope';

            const hospCompleto = `${datos.hospPorc} (${hospTextoTope})`;
            const ambCompleto = `${datos.ambPorc} (${ambTextoTope})`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="fw-semibold">${p.prestador}</td>
                <td><span class="badge bg-light text-dark border">${p.ubicacion}</span></td>
                <td class="text-center">${hospCompleto}</td>
                <td class="text-center">${ambCompleto}</td>
            `;
            tbodySel.appendChild(tr);
        }
    });

    // Mostrar sección de propuesta y botones de acción
    document.getElementById("vistaPropuesta").classList.remove("d-none");
    document.getElementById("accionesFinales").classList.remove("d-none");

    // Hacer scroll suave hacia la propuesta
    document.getElementById("vistaPropuesta").scrollIntoView({ behavior: 'smooth' });
}

function editarPropuesta() {
    document.getElementById("vistaPropuesta").classList.add("d-none");
    document.getElementById("accionesFinales").classList.add("d-none");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}