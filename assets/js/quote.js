// assets/js/quote.js - Solución corregida

// Datos de productos
const products = [
    { id: 1, name: "Espárragos Cut Tips Irregular IQF", price: 0, category: "esparragos" },
    { id: 2, name: "Espárragos Enteros IQF – Grado A", price: 0, category: "esparragos" },
    { id: 3, name: "Frutillas Slice 12 mm", price: 0, category: "frutillas" },
    { id: 4, name: "Frutilla Entera IQF", price: 0, category: "frutillas" },
    { id: 5, name: "Frambuesa Entera Congelada", price: 0, category: "frambuesas" },
    { id: 6, name: "Frambuesas Crumble Congeladas", price: 0, category: "frambuesas" },
    { id: 7, name: "Moras Cultivada Entera", price: 0, category: "moras" },
    { id: 8, name: "Arándano Entero IQF", price: 0, category: "arandanos" },
    { id: 9, name: "Hongo Boletus IQF", price: 0, category: "hongos" },
    { id: 10, name: "Kiwi rodajas (Sliced)", price: 0, category: "kiwi" },
    { id: 11, name: "Mix 4 Berries IQF", price: 0, category: "mix" },
    { id: 12, name: "Cerezas Deshuezadas", price: 0, category: "cerezas" }
];

// ID del formulario de Formspree
const FORMSPREE_FORM_ID = 'xrbavlyd';

// Inicializar EmailJS solo para enviar copias al cliente
emailjs.init("PQlMhQBtXya2tNtz-");

// Declarar funciones que se usarán en múltiples lugares
let generatePDF, sendFormspree, sendClientCopy;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando formulario de cotización');
    
    // Variables globales
    let currentStep = 1;
    const totalSteps = 3;
    
    // Inicializar select de productos
    initializeProductSelection();
    
    // Configurar navegación entre pasos
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = this.getAttribute('data-next');
            goToStep(nextStep);
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            goToStep(prevStep);
        });
    });
    
    // Botón para añadir productos
    document.querySelector('.add-product').addEventListener('click', function() {
        addProductRow();
    });
    
    // Manejar envío del formulario
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario enviado - Generando cotización');
            generateQuote();
        });
    } else {
        console.error('No se encontró el formulario con ID quoteForm');
    }
    
    // Función para inicializar la selección de productos
    function initializeProductSelection() {
        addProductRow();
        updateProgressBar();
    }
    
    // Función para añadir fila de producto
    function addProductRow(product = null) {
        const productSelection = document.getElementById('productSelection');
        if (!productSelection) {
            console.error('No se encontró el elemento productSelection');
            return;
        }
        
        const rowIndex = document.querySelectorAll('.product-item-quote').length;
        
        const row = document.createElement('div');
        row.className = 'product-item-quote row mb-3';
        row.innerHTML = `
            <div class="col-md-5 mb-2">
                <select class="form-select product-select" name="products[${rowIndex}][id]" required>
                    <option value="">Seleccione un producto</option>
                    ${products.map(p => `<option value="${p.id}" ${product && product.id === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-2 mb-2">
                <input type="number" class="form-control quantity-input" name="products[${rowIndex}][quantity]" placeholder="Cantidad" min="1" value="${product ? product.quantity : ''}" required>
            </div>
            <div class="col-md-2 mb-2">
                <select class="form-select unit-select" name="products[${rowIndex}][unit]" required>
                    <option value="kg" ${product && product.unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="lb" ${product && product.unit === 'lb' ? 'selected' : ''}>lb</option>
                    <option value="caja" ${product && product.unit === 'caja' ? 'selected' : ''}>caja</option>
                    <option value="unidad" ${product && product.unit === 'unidad' ? 'selected' : ''}>unidad</option>
                </select>
            </div>
            <div class="col-md-2 mb-2">
                <input type="number" step="0.01" class="form-control price-input" name="products[${rowIndex}][price]" placeholder="Precio unitario" value="${product ? product.price : ''}">
            </div>
            <div class="col-md-1 mb-2 text-center">
                <button type="button" class="btn btn-sm btn-danger remove-product" ${rowIndex === 0 ? 'disabled' : ''}>
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        productSelection.appendChild(row);
        
        // Event listeners para los nuevos elementos
        row.querySelector('.remove-product').addEventListener('click', function() {
            row.remove();
            calculateTotal();
        });
        
        row.querySelector('.quantity-input').addEventListener('input', calculateTotal);
        row.querySelector('.price-input').addEventListener('input', calculateTotal);
    }
    
    // Función para navegar entre pasos
    function goToStep(stepId) {
        console.log('Navegando al paso:', stepId);
        
        // Validar el paso actual antes de avanzar
        if (stepId === 'step2' && !validateStep1()) return;
        if (stepId === 'step3' && !validateStep2()) return;
        
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.classList.add('active');
            currentStep = parseInt(stepId.replace('step', ''));
            
            if (stepId === 'step3') {
                updateSummary();
            }
            
            updateProgressBar();
        } else {
            console.error('No se encontró el paso:', stepId);
        }
    }
    
    // Función para validar el paso 1
    function validateStep1() {
        const requiredFields = ['company', 'contactPerson', 'email', 'phone', 'country', 'city'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input || !input.value.trim()) {
                if (input) input.classList.add('is-invalid');
                isValid = false;
            } else {
                if (input) input.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            alert('Por favor, complete todos los campos obligatorios.');
        }
        
        return isValid;
    }
    
    // Función para validar el paso 2
    function validateStep2() {
        const productRows = document.querySelectorAll('.product-item-quote');
        let isValid = true;
        
        productRows.forEach(row => {
            const productSelect = row.querySelector('.product-select');
            const quantityInput = row.querySelector('.quantity-input');
            
            if (!productSelect.value || !quantityInput.value) {
                productSelect.classList.add('is-invalid');
                quantityInput.classList.add('is-invalid');
                isValid = false;
            } else {
                productSelect.classList.remove('is-invalid');
                quantityInput.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            alert('Por favor, complete la información de todos los productos.');
        }
        
        return isValid;
    }
    
    // Función para calcular el total
    function calculateTotal() {
        const productRows = document.querySelectorAll('.product-item-quote');
        let total = 0;
        
        productRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            total += quantity * price;
        });
        
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString('es-CL')}`;
        }
    }
    
    // Función para actualizar la barra de progreso
    function updateProgressBar() {
        const progress = (currentStep / totalSteps) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    }
    
    // Función para actualizar el resumen
    function updateSummary() {
        // Resumen del cliente
        const clientSummary = document.getElementById('clientSummary');
        if (clientSummary) {
            clientSummary.innerHTML = `
                <p><strong>Empresa:</strong> ${document.getElementById('company').value}</p>
                <p><strong>Contacto:</strong> ${document.getElementById('contactPerson').value}</p>
                <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
                <p><strong>Teléfono:</strong> ${document.getElementById('phone').value}</p>
                <p><strong>Ubicación:</strong> ${document.getElementById('city').value}, ${document.getElementById('country').value}</p>
            `;
        }
        
        // Resumen de productos
        const productsSummary = document.getElementById('productsSummary');
        if (productsSummary) {
            productsSummary.innerHTML = '';
            let total = 0;
            
            document.querySelectorAll('.product-item-quote').forEach(row => {
                const productId = row.querySelector('.product-select').value;
                const product = products.find(p => p.id == productId);
                const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
                const unit = row.querySelector('.unit-select').value;
                const price = parseFloat(row.querySelector('.price-input').value) || 0;
                const subtotal = quantity * price;
                total += subtotal;
                
                if (product) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${product.name}</td>
                        <td>${quantity} ${unit}</td>
                        <td>$${price.toLocaleString('es-CL')}</td>
                        <td>$${subtotal.toLocaleString('es-CL')}</td>
                    `;
                    productsSummary.appendChild(tr);
                }
            });
            
            const summaryTotal = document.getElementById('summaryTotal');
            if (summaryTotal) {
                summaryTotal.textContent = `$${total.toLocaleString('es-CL')}`;
            }
        }
    }
    
    // Función para generar la cotización (PDF y envío por Formspree)
    function generateQuote() {
        console.log('Generando cotización...');
        
        // Validar términos y condiciones
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox || !termsCheckbox.checked) {
            alert('Debe aceptar los términos y condiciones para continuar.');
            return;
        }
        
        // Recopilar datos del formulario
        const formData = {
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
        
        // Recopilar productos
        document.querySelectorAll('.product-item-quote').forEach(row => {
            const productId = row.querySelector('.product-select').value;
            const product = products.find(p => p.id == productId);
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const unit = row.querySelector('.unit-select').value;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const subtotal = quantity * price;
            
            if (product) {
                formData.products.push({
                    name: product.name,
                    quantity: quantity,
                    unit: unit,
                    price: price,
                    subtotal: subtotal
                });
                formData.total += subtotal;
            }
        });
        
        // Generar PDF
        generatePDF(formData);
        
        // Enviar por Formspree (para la empresa)
        sendFormspree(formData);
        
        // Enviar copia al cliente usando EmailJS
        sendClientCopy(formData);
    }
    
    // Asignar las funciones a las variables globales
    generatePDF = function(formData) {
        try {
            // Usar jsPDF para generar el PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Logo con dimensiones mejoradas
            // Nota: Asegúrate de que la ruta del logo sea correcta
            try {
                doc.addImage('../assets/img/tu-logo_6_5 (sf).png', 'PNG', 15, 15, 50, 18);
            } catch (e) {
                console.warn('No se pudo cargar el logo:', e);
            }
            
            // Título
            doc.setFontSize(20);
            doc.setTextColor(49, 85, 58);
            doc.text('COTIZACIÓN', 105, 25, { align: 'center' });
            
            // Información de la empresa
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Exportadora de Berries Wilson Campos SpA', 15, 40);
            doc.text('+56 9 3436 5048 | info@exportcampos.cl', 15, 45);
            
            // Información del cliente
            doc.setFontSize(12);
            doc.text('Cliente:', 15, 60);
            doc.setFontSize(10);
            doc.text(`Empresa: ${formData.company}`, 15, 65);
            doc.text(`Contacto: ${formData.contactPerson}`, 15, 70);
            doc.text(`Email: ${formData.email}`, 15, 75);
            doc.text(`Teléfono: ${formData.phone}`, 15, 80);
            doc.text(`Ubicación: ${formData.city}, ${formData.country}`, 15, 85);
            
            // Fecha
            const today = new Date();
            doc.text(`Fecha: ${today.toLocaleDateString('es-CL')}`, 150, 60);
            
            // Tabla de productos
            const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
            const tableRows = [];
            
            formData.products.forEach(product => {
                const productData = [
                    product.name,
                    `${product.quantity} ${product.unit}`,
                    `$${product.price.toLocaleString('es-CL')}`,
                    `$${product.subtotal.toLocaleString('es-CL')}`
                ];
                tableRows.push(productData);
            });
            
            // Añadir fila de total
            tableRows.push(['', '', 'TOTAL:', `$${formData.total.toLocaleString('es-CL')}`]);
            
            // Generar tabla
            doc.autoTable({
                startY: 100,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: {
                    fillColor: [49, 85, 58],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                }
            });
            
            // Notas
            if (formData.notes) {
                doc.text('Notas:', 15, doc.lastAutoTable.finalY + 15);
                doc.text(formData.notes, 15, doc.lastAutoTable.finalY + 20, { maxWidth: 180 });
            }
            
            // Guardar PDF
            const fileName = `Cotización_${formData.company}_${today.toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error al generar PDF:', error);
        }
    };
    
    // Función para enviar por Formspree (para la empresa)
    sendFormspree = function(formData) {
        try {
            // Crear un formulario dinámico para Formspree
            const form = document.createElement('form');
            form.style.display = 'none';
            form.method = 'POST';
            form.action = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;
            
            // Añadir campos al formulario
            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                form.appendChild(input);
            };
            
            // Campos básicos
            addField('company', formData.company);
            addField('contactPerson', formData.contactPerson);
            addField('email', formData.email);
            addField('phone', formData.phone);
            addField('country', formData.country);
            addField('city', formData.city);
            addField('address', formData.address || '');
            addField('notes', formData.notes || '');
            addField('total', `$${formData.total.toLocaleString('es-CL')}`);
            
            // Productos con formato mejorado para el correo
            let productsText = 'DETALLE DE PRODUCTOS:\n\n';
            formData.products.forEach((p, index) => {
                productsText += `PRODUCTO ${index + 1}:\n`;
                productsText += `• Nombre: ${p.name}\n`;
                productsText += `• Cantidad: ${p.quantity} ${p.unit}\n`;
                productsText += `• Precio unitario: $${p.price}\n`;
                productsText += `• Subtotal: $${p.subtotal}\n\n`;
            });
            
            addField('products', productsText);
            
            // Campo para formato de correo
            addField('_format', 'plain');
            
            // Asunto personalizado
            addField('_subject', `Nueva Cotización de ${formData.company}`);
            
            // Reply-to
            addField('_replyto', formData.email);
            
            // Añadir el formulario al DOM
            document.body.appendChild(form);
            
            // Enviar formulario
            form.submit();
        } catch (error) {
            console.error('Error al enviar a Formspree:', error);
        }
    };
    
    // Función para enviar copia al cliente usando EmailJS
    sendClientCopy = function(formData) {
        try {
            // Preparar los parámetros para la plantilla de EmailJS
            const templateParams = {
                company: formData.company,
                contact_person: formData.contactPerson,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                city: formData.city,
                address: formData.address || 'No especificada',
                notes: formData.notes || 'No hay notas adicionales',
                products: formData.products.map(p => 
                    `${p.name} - ${p.quantity} ${p.unit} - $${p.price} c/u - Subtotal: $${p.subtotal}`
                ).join('\n'),
                total: `$${formData.total.toLocaleString('es-CL')}`,
                date: new Date().toLocaleDateString('es-CL')
            };

            // Enviar el correo usando EmailJS
            emailjs.send('service_ox0em5e', 'template_oy8mf0n', templateParams)
                .then(function(response) {
                    console.log('Copia al cliente enviada!', response.status, response.text);
                    // Redirigir a la página de agradecimiento
                    window.location.href = 'quote-thankyou.html';
                }, function(error) {
                    console.error('Error al enviar copia al cliente:', error);
                    // Aún así redirigir pero mostrar mensaje de advertencia
                    alert('¡Cotización generada con éxito! Sin embargo, hubo un problema al enviar la copia a su correo electrónico.');
                    window.location.href = 'quote-thankyou.html';
                });
        } catch (error) {
            console.error('Error en sendClientCopy:', error);
            // Redirigir incluso si hay error
            window.location.href = 'quote-thankyou.html';
        }
    };
});