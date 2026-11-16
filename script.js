let seleccionadosIds = new Set();

document.addEventListener("DOMContentLoaded", () => {
    // 1. Asignar fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fechaPropuesta").value = hoy;
    document.getElementById("lblFecha").innerText = hoy.split('-').reverse().join('/');

    // 2. Renderizar la tabla inicial con los datos de prestadores.js
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
        const estaAgregado = seleccionadosIds.has(p.id);
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
            <td class="text-center">${p.hospitalaria}</td>
            <td class="text-center">${p.ambulatoria}</td>
        `;
        tbody.appendChild(tr);
    });
}

function togglePrestador(id) {
    if (seleccionadosIds.has(id)) {
        seleccionadosIds.delete(id);
    } else {
        seleccionadosIds.add(id);
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

    if (seleccionadosIds.size === 0) {
        alert("Selecciona al menos un prestador para la propuesta.");
        return;
    }

    document.getElementById("lblNombreCliente").innerText = nombre;
    document.getElementById("lblValorPlan").innerText = valor.toUpperCase().includes("UF") ? valor : valor + " UF";

    const fechaInput = document.getElementById("fechaPropuesta").value;
    if (fechaInput) {
        document.getElementById("lblFecha").innerText = fechaInput.split('-').reverse().join('/');
    }

    const tbodySel = document.getElementById("tablaSeleccionadosBody");
    tbodySel.innerHTML = "";

    seleccionadosIds.forEach(id => {
        const p = prestadoresData.find(item => item.id === id);
        if (p) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="fw-semibold">${p.prestador}</td>
                <td><span class="badge bg-light text-dark border">${p.ubicacion}</span></td>
                <td class="text-center">${p.hospitalaria}</td>
                <td class="text-center">${p.ambulatoria}</td>
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