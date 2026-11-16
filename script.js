let seleccionadosMap = new Map(); // Guarda ID -> { hospPorc, hospTope, ambPorc, ambTope, destacado }

document.addEventListener("DOMContentLoaded", () => {
    // 1. Asignar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fechaPropuesta").value = hoy;
    document.getElementById("lblFecha").innerText = hoy.split('-').reverse().join('/');

    // 2. Renderizar la tabla inicial (bloqueada inicialmente)
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

// Validar que exista Nombre y Valor de UF para desbloquear el paso 2
function validarPasoUno() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const valor = document.getElementById("valorPlan").value.trim();
    const bloquePrestadores = document.getElementById("bloquePrestadores");
    const alertaBloqueo = document.getElementById("alertaBloqueo");

    if (nombre !== "" && valor !== "") {
        bloquePrestadores.classList.remove("opacity-50");
        bloquePrestadores.style.pointerEvents = "auto";
        alertaBloqueo.classList.add("d-none");
    } else {
        bloquePrestadores.classList.add("opacity-50");
        bloquePrestadores.style.pointerEvents = "none";
        alertaBloqueo.classList.remove("d-none");
    }
}

function renderizarTablaPrestadores(lista) {
    const tbody = document.getElementById("tablaPrestadoresBody");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No se encontraron prestadores</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const estaAgregado = seleccionadosMap.has(p.id);
        const datos = seleccionadosMap.get(p.id) || { hospPorc: "", hospTope: "S/T", ambPorc: "", ambTope: "S/T", destacado: false };
        
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
                    <input type="number" min="0" max="100" class="form-control text-center input-porcentaje ${datos.hospPorc !== '' ? 'input-activo-rojo' : ''}" id="hospPorc_${p.id}" value="${datos.hospPorc}" placeholder="Ingresar %" ${!estaAgregado ? 'disabled' : ''} oninput="actualizarEstiloInput(this); actualizarDatoMap(${p.id})">
                    <span class="input-group-text bg-light fw-bold">%</span>
                </div>
                <select class="form-select form-select-sm select-tope ${datos.hospTope !== '' ? 'input-activo-rojo' : ''}" id="hospTope_${p.id}" ${!estaAgregado ? 'disabled' : ''} onchange="actualizarEstiloSelect(this); actualizarDatoMap(${p.id})">
                    <option value="S/T" ${datos.hospTope === 'S/T' ? 'selected' : ''}>Sin Tope</option>
                    <option value="C/T" ${datos.hospTope === 'C/T' ? 'selected' : ''}>Con Tope</option>
                </select>
            </td>
            <td class="text-center">
                <div class="input-group input-group-sm mb-1">
                    <input type="number" min="0" max="100" class="form-control text-center input-porcentaje ${datos.ambPorc !== '' ? 'input-activo-rojo' : ''}" id="ambPorc_${p.id}" value="${datos.ambPorc}" placeholder="Ingresar %" ${!estaAgregado ? 'disabled' : ''} oninput="actualizarEstiloInput(this); actualizarDatoMap(${p.id})">
                    <span class="input-group-text bg-light fw-bold">%</span>
                </div>
                <select class="form-select form-select-sm select-tope ${datos.ambTope !== '' ? 'input-activo-rojo' : ''}" id="ambTope_${p.id}" ${!estaAgregado ? 'disabled' : ''} onchange="actualizarEstiloSelect(this); actualizarDatoMap(${p.id})">
                    <option value="S/T" ${datos.ambTope === 'S/T' ? 'selected' : ''}>Sin Tope</option>
                    <option value="C/T" ${datos.ambTope === 'C/T' ? 'selected' : ''}>Con Tope</option>
                </select>
            </td>
            <td class="text-center">
                <div class="form-check d-flex justify-content-center">
                    <input class="form-check-input fs-5" type="checkbox" id="destacado_${p.id}" ${datos.destacado ? 'checked' : ''} ${!estaAgregado ? 'disabled' : ''} onchange="actualizarDatoMap(${p.id})" style="cursor: pointer;">
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarEstiloInput(input) {
    if (input.value.trim() !== "") {
        input.classList.add("input-activo-rojo");
    } else {
        input.classList.remove("input-activo-rojo");
    }
}

function actualizarEstiloSelect(select) {
    select.classList.add("input-activo-rojo");
}

function togglePrestador(id) {
    if (seleccionadosMap.has(id)) {
        seleccionadosMap.delete(id);
    } else {
        seleccionadosMap.set(id, { hospPorc: "", hospTope: "S/T", ambPorc: "", ambTope: "S/T", destacado: false });
    }

    const texto = document.getElementById("buscadorPrestador").value.toLowerCase();
    const filtrados = prestadoresData.filter(p => 
        p.prestador.toLowerCase().includes(texto) || 
        p.ubicacion.toLowerCase().includes(texto)
    );
    renderizarTablaPrestadores(filtrados);
    actualizarBotonGenerar();
}

function actualizarDatoMap(id) {
    if (seleccionadosMap.has(id)) {
        const hospPorc = document.getElementById(`hospPorc_${id}`).value.trim();
        const hospTope = document.getElementById(`hospTope_${id}`).value;
        const ambPorc = document.getElementById(`ambPorc_${id}`).value.trim();
        const ambTope = document.getElementById(`ambTope_${id}`).value;
        const destacado = document.getElementById(`destacado_${id}`).checked;

        seleccionadosMap.set(id, { hospPorc, hospTope, ambPorc, ambTope, destacado });
    }
}

function actualizarBotonGenerar() {
    const btn = document.getElementById("btnGenerar");
    if (seleccionadosMap.size > 0) {
        btn.removeAttribute("disabled");
    } else {
        btn.setAttribute("disabled", "true");
    }
}

function generarPropuesta() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const valor = document.getElementById("valorPlan").value.trim();
    const infoPersonalizada = document.getElementById("infoPersonalizada").value.trim();

    if (!nombre || !valor) {
        alert("Por favor, completa el nombre del cliente y el valor del plan.");
        return;
    }

    if (seleccionadosMap.size === 0) {
        alert("Selecciona al menos un prestador para el plan.");
        return;
    }

    document.getElementById("lblNombreCliente").innerText = nombre;
    document.getElementById("lblValorPlan").innerText = valor.toUpperCase().includes("UF") ? valor : valor + " UF";

    const seccionInfo = document.getElementById("seccionInfoPersonalizada");
    if (infoPersonalizada !== "") {
        document.getElementById("lblInfoPersonalizada").innerText = infoPersonalizada;
        seccionInfo.classList.remove("d-none");
    } else {
        seccionInfo.classList.add("d-none");
    }

    const fechaInput = document.getElementById("fechaPropuesta").value;
    if (fechaInput) {
        document.getElementById("lblFecha").innerText = fechaInput.split('-').reverse().join('/');
    }

    const tbodySel = document.getElementById("tablaSeleccionadosBody");
    tbodySel.innerHTML = "";

    seleccionadosMap.forEach((datos, id) => {
        const p = prestadoresData.find(item => item.id === id);
        if (p) {
            const hospTextoTope = datos.hospTope === 'S/T' ? 'Sin Tope' : 'Con Tope';
            const ambTextoTope = datos.ambTope === 'S/T' ? 'Sin Tope' : 'Con Tope';

            const hospPorcStr = datos.hospPorc !== "" ? datos.hospPorc : "0";
            const ambPorcStr = datos.ambPorc !== "" ? datos.ambPorc : "0";

            const hospCompleto = `${hospPorcStr}% (${hospTextoTope})`;
            const ambCompleto = `${ambPorcStr}% (${ambTextoTope})`;

            const claseDestacado = datos.destacado ? 'destacado-manual' : '';

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="fw-semibold ${claseDestacado}">${p.prestador}</td>
                <td><span class="badge bg-light text-dark border ${claseDestacado}">${p.ubicacion}</span></td>
                <td class="text-center ${claseDestacado}">${hospCompleto}</td>
                <td class="text-center ${claseDestacado}">${ambCompleto}</td>
            `;
            tbodySel.appendChild(tr);
        }
    });

    document.getElementById("vistaPropuesta").classList.remove("d-none");
    document.getElementById("accionesFinales").classList.remove("d-none");
    document.getElementById("vistaPropuesta").scrollIntoView({ behavior: 'smooth' });
}

function editarPropuesta() {
    document.getElementById("vistaPropuesta").classList.add("d-none");
    document.getElementById("accionesFinales").classList.add("d-none");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}