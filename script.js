document.addEventListener('DOMContentLoaded', () => {

    // --- Logic for index.html ---
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '/Popo/') {
        const personalDataForm = document.getElementById('personal-data-form');
        if (personalDataForm) {
            personalDataForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const contact = document.getElementById('contact').value;

                if (name && contact) {
                    localStorage.setItem('customerName', name);
                    localStorage.setItem('customerContact', contact);
                    window.location.href = 'venda.html';
                } else {
                    alert('Por favor, preencha todos os campos.');
                }
            });
        }
    }

    // --- Logic for venda.html ---
    if (window.location.pathname.endsWith('venda.html')) {
        const productForm = document.getElementById('product-details-form');
        const gateTypeRadios = document.querySelectorAll('input[name="gate_type"]');
        const designFieldset = document.getElementById('design-fieldset');
        const designOptionsContainer = document.getElementById('design-options-container');
        
        const materialOptions = document.querySelectorAll('.material-option');
        const materialDescription = document.getElementById('material-description');
        const selectedMaterialInput = document.getElementById('selected_material');
        const addToCartBtn = document.getElementById('add-to-cart');
        const finalizeOrderBtn = document.getElementById('finalize-order');
        const cartItemsContainer = document.getElementById('cart-items');

        // --- Lógica para suportar JPG, PNG e GIF nos Materiais ---
        const materialImages = document.querySelectorAll('.material-option img');
        materialImages.forEach(img => {
            const materialKey = img.dataset.material;
            if (materialKey) {
                const extensions = ['jpg', 'png', 'gif'];
                let imageFound = false;
                extensions.forEach(ext => {
                    const imgPath = `material/${materialKey}.${ext}`;
                    const tempImg = new Image();
                    tempImg.src = imgPath;
                    tempImg.onload = () => {
                        if (!imageFound) {
                            imageFound = true;
                            img.src = imgPath;
                        }
                    };
                });
            }
        });

        // --- Lógica do Modal de Zoom ---
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const closeBtn = document.getElementsByClassName("close")[0];

        if (closeBtn) {
            closeBtn.onclick = function() { 
                modal.style.display = "none";
            }
        }
        if (modal) {
            modal.onclick = function(e) {
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            }
        }

        let cart = [];

        const designFolders = {
            'Grade Fixa': 'Grade Fixa',
            'Grade Móvel de Abrir': 'Grade Móvel de Abrir',
            'Grade Móvel de Correr': 'Grade Móvel de Correr',
            'Portão Móvel de Abrir': 'Portão Móvel de Abrir',
            'Portão Móvel de Correr': 'Portão Móvel de Correr',
            'Janela cor porta de abrir': 'Janela cor porta de abrir',
            'Janela cor porta de correr': 'Janela cor porta de correr'
        };

        const materialDetails = {
            ferro: "<strong>Tipo Ferro (Tradicional):</strong><br>Boa resistência e custo mais baixo, mas exige muita manutenção para evitar oxidação (ferrugem).",
            aco_galvanizado: "<strong>Tipo Aço Galvanizado:</strong><br>Aço revestido com uma camada de zinco para alta resistência à corrosão, ideal para áreas externas.",
            aco_inox: "<strong>Tipo Aço Inoxidável:</strong><br>Ideal para ambientes com umidade ou corrosivos (indústria química, bebidas), oferece alta resistência e durabilidade.",
            metalon: "<strong>Tipo Metalon (Tubo de Aço):</strong><br>Tubos quadrados, redondos ou retangulares, oferecem segurança, resistência e design moderno.",
            aluminio: "<strong>Tipo Alumínio:</strong><br>Leve, resistente à corrosão e com baixa manutenção, mas menos resistente a impactos fortes comparado ao ferro/aço."
        };

        function updateDesignOptions(gateType) {
            const folder = designFolders[gateType];
            designOptionsContainer.innerHTML = '';
            if (!folder) {
                designFieldset.style.display = 'none';
                return;
            }

            designFieldset.style.display = 'block';
            const maxDesigns = 20; // Checa até o número 20
            const extensions = ['jpg', 'png', 'gif']; // Extensões permitidas

            for (let i = 1; i <= maxDesigns; i++) {
                const designName = `Desenho ${i}`;

                const label = document.createElement('label');
                label.style.display = 'none'; // Começa oculto

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'design';
                // O value será definido quando a imagem carregar

                // Cria o elemento com o número do modelo
                const numberText = document.createElement('div');
                numberText.textContent = `Nº ${i}`;
                numberText.style.textAlign = 'center';
                numberText.style.fontWeight = 'bold';
                numberText.style.marginBottom = '5px';

                const img = document.createElement('img');
                img.alt = designName;
                img.style.width = '150px';
                img.style.height = '150px';
                img.style.objectFit = 'cover';
                img.style.cursor = 'pointer'; // Indica que é clicável

                // Evento para abrir o modal ao clicar na imagem
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Impede que selecione o radio ao clicar apenas para ver
                    modal.style.display = "block";
                    modalImg.src = e.target.src;
                });
                
                label.appendChild(input);
                label.appendChild(numberText);
                label.appendChild(img);
                designOptionsContainer.appendChild(label);

                // Tenta carregar cada extensão
                let imageFound = false;
                extensions.forEach(ext => {
                    const imgPath = `${folder}/${i}.${ext}`;
                    const tempImg = new Image();
                    tempImg.src = imgPath;
                    
                    tempImg.onload = () => {
                        if (!imageFound) {
                            imageFound = true;
                            img.src = imgPath;
                            input.value = imgPath;
                            label.style.display = ''; // Mostra a opção
                        }
                    };
                });
            }
        }
        
        gateTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                updateDesignOptions(e.target.value);
            });
        });

        // Inicializa com o tipo selecionado
        const initialGateType = document.querySelector('input[name="gate_type"]:checked').value;
        updateDesignOptions(initialGateType);


        materialOptions.forEach(option => {
            option.addEventListener('click', () => {
                materialOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const materialName = option.querySelector('p').textContent.trim();
                selectedMaterialInput.value = materialName;
                const materialKey = option.querySelector('img').dataset.material;
                materialDescription.innerHTML = materialDetails[materialKey];
                materialDescription.style.display = 'block';
            });
        });

        addToCartBtn.addEventListener('click', () => {
            const gateType = document.querySelector('input[name="gate_type"]:checked').value;
            const selectedDesignInput = document.querySelector('input[name="design"]:checked');
            const height = document.getElementById('height').value;
            const width = document.getElementById('width').value;
            const material = selectedMaterialInput.value;

            if (!height || !width || !material) {
                alert('Por favor, preencha todos os campos do orçamento (Medidas e Material).');
                return;
            }
            
            if (!selectedDesignInput) {
                alert('Por favor, escolha um desenho.');
                return;
            }
            const design = selectedDesignInput.value;

            const item = {
                id: Date.now(),
                gateType,
                design,
                height,
                width,
                material
            };

            cart.push(item);
            updateCartDisplay();
            productForm.reset();
            materialDescription.style.display = 'none';
            materialOptions.forEach(opt => opt.classList.remove('selected'));
            selectedMaterialInput.value = '';
            // Re-chama a função para resetar as opções de desenho para o padrão
            const defaultGateType = document.querySelector('input[name="gate_type"]:checked').value;
            updateDesignOptions(defaultGateType);
        });

        function updateCartDisplay() {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                // Mostra a imagem no carrinho
                cartItem.innerHTML = `
                    <div class="cart-item-details">
                        <p><strong>Tipo:</strong> ${item.gateType}</p>
                        <p><strong>Medidas:</strong> ${item.height}m x ${item.width}m</p>
                        <p><strong>Material:</strong> ${item.material}</p>
                    </div>
                    <div class="cart-item-design">
                         <p><strong>Desenho:</strong></p>
                        <img src="${item.design}" alt="Desenho selecionado" style="width: 100px; height: 100px; object-fit: cover;"/>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remover</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }

        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = parseInt(e.target.dataset.id);
                cart = cart.filter(item => item.id !== itemId);
                updateCartDisplay();
            }
        });

        finalizeOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('O seu carrinho está vazio. Adicione pelo menos um item antes de finalizar.');
                return;
            }

            const customerName = localStorage.getItem('customerName');
            const customerContact = localStorage.getItem('customerContact');

            if (!customerName || !customerContact) {
                alert('Dados de contato não encontrados! Por favor, volte à página inicial.');
                window.location.href = 'index.html';
                return;
            }

            const whatsappNumber = '5571987792252';
            let message = `*Novo Pedido de Orçamento*\n\n`;
            message += `*Cliente:* ${customerName}\n`;
            message += `*Contato:* ${customerContact}\n\n`;
            
            cart.forEach((item, index) => {
                message += `*========= Item ${index + 1} =========*\n`;
                message += `*Tipo:* ${item.gateType}\n`;
                // Extrai o número do modelo do caminho da imagem (ex: "Grade Fixa/1.png" -> "1")
                const designModel = item.design.split('/').pop().replace(/\.(jpg|png|gif)$/i, '');
                message += `*Desenho:* Modelo nº ${designModel}\n`;
                
                // Gera o link para a imagem hospedada
                const fullImageUrl = new URL(item.design, window.location.href).href;
                message += `*Ver Foto:* ${fullImageUrl}\n`;

                message += `*Medidas:* ${item.height}m (altura) x ${item.width}m (largura)\n`;
                message += `*Material:* ${item.material}\n\n`;
            });

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }
});
