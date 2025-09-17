/* ----------------------------------------------------------
   EXPORTCAMPOS – COTIZADOR EN LÍNEA  (ESPAÑOL)
   ---------------------------------------------------------- */
// Logo en base64 (asegúrate de que logo.js exporte correctamente)
import LOGO_JPEG_B64 from './logo.js';

/* 1.  CONFIG GLOBAL */
const FORMSPREE_FORM_ID = 'xrbavlyd';   // ID real Formspree

const products = [
    { id: 1, name: 'Espárragos Cut Tips Irregular IQF',         price: 0, category: 'esparragos' },
    { id: 2, name: 'Espárragos Enteros IQF – Grado A',          price: 0, category: 'esparragos' },
    { id: 3, name: 'Frutillas Slice 12 mm',                     price: 0, category: 'frutillas'  },
    { id: 4, name: 'Frutilla Entera IQF',                       price: 0, category: 'frutillas'  },
    { id: 5, name: 'Frambuesa Entera Congelada',                price: 0, category: 'frambuesas' },
    { id: 6, name: 'Frambuesas Crumble Congeladas',             price: 0, category: 'frambuesas' },
    { id: 7, name: 'Moras Cultivada Entera',                    price: 0, category: 'moras'      },
    { id: 8, name: 'Arándano Entero IQF',                       price: 0, category: 'arandanos'  },
    { id: 9, name: 'Hongo Boletus IQF',                         price: 0, category: 'hongos'     },
    { id:10, name: 'Kiwi rodajas (Sliced)',                     price: 0, category: 'kiwi'       },
    { id:11, name: 'Mix 4 Berries IQF',                         price: 0, category: 'mix'        },
    { id:12, name: 'Cerezas Deshuezadas',                       price: 0, category: 'cerezas'    }
];

/* 2.  INICIALIZAR EmailJS (solo para copia al cliente) */
emailjs.init('PQlMhQBtXya2tNtz-');   // Public Key real

/* 3.  UTILS */
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
    initProductSelection();
    bindNavigation();
    bindAddProduct();
    bindSubmit();
});

/* ----------  NAVEGACIÓN  ---------- */
function bindNavigation() {
    document.querySelectorAll('.next-step').forEach(btn =>
        btn.addEventListener('click', () => goToStep(btn.dataset.next))
    );
    document.querySelectorAll('.prev-step').forEach(btn =>
        btn.addEventListener('click', () => goToStep(btn.dataset.prev))
    );
}

function goToStep(stepId) {
    if (stepId === 'step2' && !validateStep1()) return;
    if (stepId === 'step3' && !validateStep2()) return;

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
    currentStep = parseInt(stepId.replace('step', ''));
    if (stepId === 'step3') updateSummary();
    updateProgressBar();
}

/* ----------  PRODUCTOS  ---------- */
function initProductSelection() {
    addProductRow();
    updateProgressBar();
}

function bindAddProduct() {
    document.querySelector('.add-product').addEventListener('click', () => addProductRow());
}

function addProductRow(product = null) {
    const container = document.getElementById('productSelection');
    const idx = container.querySelectorAll('.product-item-quote').length;
    const row = document.createElement('div');
    row.className = 'product-item-quote row mb-3';
    row.innerHTML = `
        <div class="col-md-5 mb-2"><select class="form-select product-select" name="products[${idx}][id]" required>
            <option value="">Seleccione un producto</option>
            ${products.map(p => `<option value="${p.id}" ${product && product.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select></div>
        <div class="col-md-2 mb-2"><input type="number" class="form-control quantity-input" name="products[${idx}][quantity]" placeholder="Cantidad" min="1" value="${product ? product.quantity : ''}" required></div>
        <div class="col-md-2 mb-2"><select class="form-select unit-select" name="products[${idx}][unit]" required>
            <option value="kg" ${product && product.unit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="lb" ${product && product.unit === 'lb' ? 'selected' : ''}>lb</option>
            <option value="caja" ${product && product.unit === 'caja' ? 'selected' : ''}>caja</option>
            <option value="unidad" ${product && product.unit === 'unidad' ? 'selected' : ''}>unidad</option>
        </select></div>
        <div class="col-md-2 mb-2"><input type="number" step="0.01" class="form-control price-input" name="products[${idx}][price]" placeholder="Precio unitario" value="${product ? product.price : ''}"></div>
        <div class="col-md-1 mb-2 text-center"><button type="button" class="btn btn-sm btn-danger remove-product" ${idx === 0 ? 'disabled' : ''}><i class="bi bi-trash"></i></button></div>`;
    container.appendChild(row);
    row.querySelector('.remove-product').addEventListener('click', () => { row.remove(); calculateTotal(); });
    row.querySelectorAll('.quantity-input, .price-input').forEach(inp => inp.addEventListener('input', calculateTotal));
}

/* ----------  VALIDACIONES  ---------- */
function validateStep1() {
    const required = ['company', 'contactPerson', 'email', 'phone', 'country', 'city'];
    let ok = true;
    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('is-invalid'); ok = false; } else el.classList.remove('is-invalid');
    });
    if (!ok) alert('Complete todos los campos obligatorios.');
    return ok;
}

function validateStep2() {
    let ok = true;
    document.querySelectorAll('.product-item-quote').forEach(r => {
        const sel = r.querySelector('.product-select'), qty = r.querySelector('.quantity-input');
        if (!sel.value || !qty.value) { sel.classList.add('is-invalid'); qty.classList.add('is-invalid'); ok = false; }
        else { sel.classList.remove('is-invalid'); qty.classList.remove('is-invalid'); }
    });
    if (!ok) alert('Complete la información de todos los productos.');
    return ok;
}

/* ----------  CÁLCULO TOTAL  ---------- */
function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.product-item-quote').forEach(r => {
        const q = parseFloat(r.querySelector('.quantity-input').value) || 0;
        const p = parseFloat(r.querySelector('.price-input').value) || 0;
        total += q * p;
    });
    document.getElementById('totalAmount').textContent = `$${total.toLocaleString('es-CL')}`;
}

/* ----------  BARRA PROGRESO  ---------- */
function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    const bar = document.querySelector('.progress-bar');
    bar.style.width = `${progress}%`;
    bar.setAttribute('aria-valuenow', progress);
}

/* ----------  RESUMEN PASO 3  ---------- */
function updateSummary() {
    // Resumen cliente
    document.getElementById('clientSummary').innerHTML = `
        <p><strong>Empresa:</strong> ${document.getElementById('company').value}</p>
        <p><strong>Contacto:</strong> ${document.getElementById('contactPerson').value}</p>
        <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
        <p><strong>Teléfono:</strong> ${document.getElementById('phone').value}</p>
        <p><strong>Ubicación:</strong> ${document.getElementById('city').value}, ${document.getElementById('country').value}</p>`;

    // Resumen productos
    const tbody = document.getElementById('productsSummary');
    tbody.innerHTML = '';
    let total = 0;
    document.querySelectorAll('.product-item-quote').forEach(r => {
        const prodId = r.querySelector('.product-select').value;
        const prod = products.find(p => p.id == prodId);
        const qty = parseFloat(r.querySelector('.quantity-input').value) || 0;
        const unit = r.querySelector('.unit-select').value;
        const price = parseFloat(r.querySelector('.price-input').value) || 0;
        const sub = qty * price;
        total += sub;
        if (prod) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${prod.name}</td><td>${qty} ${unit}</td><td>$${price.toLocaleString('es-CL')}</td><td>$${sub.toLocaleString('es-CL')}</td>`;
            tbody.appendChild(tr);
        }
    });
    document.getElementById('summaryTotal').textContent = `$${total.toLocaleString('es-CL')}`;
}

/* ----------  SUBMIT FINAL  ---------- */
function bindSubmit() {
    document.getElementById('quoteForm').addEventListener('submit', e => {
        e.preventDefault();
        if (!document.getElementById('terms').checked) {
            alert('Debe aceptar los términos y condiciones.');
            return;
        }
        generateQuote();
    });
}

/* ----------  GENERAR COTIZACIÓN (PDF + EMAILS)  ---------- */
async function generateQuote() {
    const formData = collectFormData();
    generatePDF(formData);
    
    // Mostrar estado de envío
    const btn = document.querySelector('#quoteForm button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando…';
    
    try {
        await Promise.all([
            sendFormspree(formData),
            sendClientCopy(formData)
        ]);
        alert('¡Cotización enviada con éxito! Revisa tu correo (incluido spam).');
        window.location.href = '../quote-thankyou.html';
    } catch (error) {
        console.error('Error en el envío:', error);
        alert('Se generó el PDF, pero hubo un problema al enviar los correos. Te contactaremos pronto.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send me-2"></i>Enviar Solicitud de Cotización';
    }
}

function collectFormData() {
    const data = {
        company: document.getElementById('company').value,
        contactPerson: document.getElementById('contactPerson').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes').value,
        products: [],
        total: 0
    };
    document.querySelectorAll('.product-item-quote').forEach(r => {
        const prodId = r.querySelector('.product-select').value;
        const prod = products.find(p => p.id == prodId);
        const qty = parseFloat(r.querySelector('.quantity-input').value) || 0;
        const unit = r.querySelector('.unit-select').value;
        const price = parseFloat(r.querySelector('.price-input').value) || 0;
        const sub = qty * price;
        if (prod) {
            data.products.push({ name: prod.name, quantity: qty, unit: unit, price: price, subtotal: sub });
            data.total += sub;
        }
    });
    return data;
}

/* ----------  GENERAR PDF  ---------- */
function generatePDF(d) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const today = new Date();

    // Logo nítido JPEG base-64
    try {
        doc.addImage(LOGO_JPEG_B64, 'JPEG', 15, 15, 50, 18);
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
    }

    doc.setFontSize(20);
    doc.setTextColor(49, 85, 58);
    doc.text('COTIZACIÓN', 105, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${today.toLocaleDateString('es-CL')}`, 15, 45);
    doc.text(`Empresa: ${d.company}`, 15, 52);
    doc.text(`Contacto: ${d.contactPerson}`, 15, 59);
    doc.text(`Email: ${d.email}`, 15, 66);
    doc.text(`Teléfono: ${d.phone}`, 15, 73);
    doc.text(`País: ${d.country} - Ciudad: ${d.city}`, 15, 80);

    // Tabla de productos
    const headers = [['#', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']];
    const rows = d.products.map((p, i) => [
        i + 1,
        p.name,
        `${p.quantity} ${p.unit}`,
        `$${p.price.toLocaleString('es-CL')}`,
        `$${p.subtotal.toLocaleString('es-CL')}`
    ]);

    doc.autoTable({
        head: headers,
        body: rows,
        startY: 90,
        theme: 'grid',
        headStyles: { fillColor: [49, 85, 58] },
        styles: { fontSize: 9 }
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $${d.total.toLocaleString('es-CL')}`, 180, finalY, { align: 'right' });

    // Notas
    if (d.notes) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('Notas:', 15, finalY + 10);
        doc.text(d.notes, 15, finalY + 17);
    }

    // Descarga
    doc.save(`Cotizacion_${d.company}_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.pdf`);
}

/* ----------  ENVÍO A LA EMPRESA (Formspree)  ---------- */
async function sendFormspree(d) {
    try {
        const formData = new FormData();
        
        // Campos estándar
        formData.append('empresa', d.company);
        formData.append('persona_contacto', d.contactPerson);
        formData.append('email', d.email);
        formData.append('telefono', d.phone);
        formData.append('pais', d.country);
        formData.append('ciudad', d.city);
        formData.append('direccion', d.address || '');
        formData.append('notas', d.notes || '');
        formData.append('total', `$${d.total.toLocaleString('es-CL')}`);
        
        // Productos
        let productosTexto = '';
        d.products.forEach((p, i) => {
            productosTexto += `${i+1}. ${p.name} - ${p.quantity} ${p.unit} - $${p.price} c/u - Subtotal: $${p.subtotal}\n`;
        });
        formData.append('productos', productosTexto);
        
        // Campos especiales de Formspree
        formData.append('_subject', `Nueva Cotización - ${d.company}`);
        formData.append('_replyto', d.email);
        
        const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error enviando a Formspree:', error);
        throw error;
    }
}

/* ----------  COPIA AL CLIENTE (EmailJS)  ---------- */
async function sendClientCopy(d) {
    try {
        // Formatear productos para EmailJS
        let productsHTML = '';
        d.products.forEach((p, i) => {
            productsHTML += `
                <tr>
                    <td>${i+1}. ${p.name}</td>
                    <td>${p.quantity} ${p.unit}</td>
                    <td>$${p.price.toLocaleString('es-CL')}</td>
                    <td>$${p.subtotal.toLocaleString('es-CL')}</td>
                </tr>`;
        });

        const params = {
            contact_person: d.contactPerson,
            company: d.company,
            email: d.email,
            phone: d.phone,
            country: d.country,
            city: d.city,
            address: d.address || 'No especificada',
            products: productsHTML,
            total: `$${d.total.toLocaleString('es-CL')}`,
            notes: d.notes || 'Sin notas adicionales',
            reply_to: 'info@exportcampos.cl',
            subject: `Copia de su cotización - ${d.company}`
        };

        const response = await emailjs.send('service_3bj2l7l','template_0nx6s7p', params);
        return response;
    } catch (error) {
        console.error('Error enviando copia al cliente:', error);
        throw error;
    }
}