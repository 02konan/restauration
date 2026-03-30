
 
        // === GESTION DU TOAST DE BIENVENUE AVEC LOCALSTORAGE ===
        document.addEventListener('DOMContentLoaded', function() {
            const hasVisited = localStorage.getItem('hasVisitedBefore');
            
            if (!hasVisited) {
                const welcomeToast = document.getElementById('welcomeToast');
                if (welcomeToast) {
                    const toast = new bootstrap.Toast(welcomeToast, {
                        autohide: true,
                        delay: 5000
                    });
                    toast.show();
                    
                    localStorage.setItem('hasVisitedBefore', 'true');
                    localStorage.setItem('firstVisitDate', new Date().toISOString());
                    localStorage.setItem('visitCount', '1');
                }
            } else {
                let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
                visitCount++;
                localStorage.setItem('visitCount', visitCount);
                localStorage.setItem('lastVisitDate', new Date().toISOString());
            }
        });
        
        // Configuration des prix
        const UNIT_PRICE = 5000;
        const DELIVERY_FEE = 0;
        let currentQuantity = 1;
        
        // Éléments DOM
        const quantityDisplay = document.getElementById('quantityDisplay');
        const displayQuantity = document.getElementById('displayQuantity');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('totalAmount');
        const decrementBtn = document.getElementById('decrementBtn');
        const incrementBtn = document.getElementById('incrementBtn');
        
        // Éléments hidden
        const hiddenQuantity = document.getElementById('hiddenQuantity');
        const hiddenUnitPrice = document.getElementById('hiddenUnitPrice');
        const hiddenSubtotal = document.getElementById('hiddenSubtotal');
        const hiddenTotal = document.getElementById('hiddenTotal');
        
        // Fonction pour formater le prix
        function formatPrice(price) {
            return price.toLocaleString('fr-FR') + ' F';
        }
        
        // Mettre à jour l'affichage
        function updateOrderSummary() {
            const subtotal = UNIT_PRICE * currentQuantity;
            const total = subtotal + DELIVERY_FEE;
            
            quantityDisplay.textContent = currentQuantity;
            displayQuantity.textContent = currentQuantity;
            subtotalElement.textContent = formatPrice(subtotal);
            totalElement.textContent = formatPrice(total);
            
            hiddenQuantity.value = currentQuantity;
            hiddenSubtotal.value = subtotal;
            hiddenTotal.value = total;
        }
        
        // Événements des boutons
        incrementBtn.addEventListener('click', () => {
            currentQuantity++;
            updateOrderSummary();
        });
        
        decrementBtn.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                updateOrderSummary();
            } else {
                decrementBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    decrementBtn.style.transform = '';
                }, 200);
                
                Swal.fire({
                    icon: 'warning',
                    title: 'Quantité minimale',
                    text: 'La quantité ne peut pas être inférieure à 1',
                    confirmButtonColor: '#dc3545',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
        
        // Soumission du formulaire
        const orderForm = document.getElementById('orderForm');
        
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
            const contactPhone = document.getElementById('contactPhone').value.trim();
            const promoCode = document.getElementById('promoCode').value.trim();
            const quantity = parseInt(hiddenQuantity.value);
            const unitPrice = parseInt(hiddenUnitPrice.value);
            
            // Validation
            if (!deliveryAddress) {
                Swal.fire({
                    icon: 'error',
                    title: 'Champ manquant',
                    text: 'Veuillez indiquer la commune de livraison',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }
            
            if (!contactPhone) {
                Swal.fire({
                    icon: 'error',
                    title: 'Champ manquant',
                    text: 'Veuillez indiquer votre numéro de contact',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }
            
            const phoneRegex = /^[0-9\s\+]{8,15}$/;
            if (!phoneRegex.test(contactPhone.replace(/\s/g, ''))) {
                Swal.fire({
                    icon: 'error',
                    title: 'Contact invalide',
                    text: 'Veuillez entrer un numéro de téléphone valide',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }

            // Validation du code promo (facultatif)
            if (promoCode) {
                // format requis : 8 caractères au total, 1 lettre + '-' + 2 lettres + '-' + 3 chiffres
                // exemples valides : C-YO-078, G-CE-045
                const strictPromoRegex = /^[A-Z]-[A-Z]{2}-\d{3}$/;
                if (!strictPromoRegex.test(promoCode.toUpperCase())) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Code promo invalide',
                        html: 'Le code promo doit être au format <strong>C-YO-078</strong> ou <strong>G-CE-045</strong> (8 caractères, derniers 3 chiffres).',
                        confirmButtonColor: '#dc3545'
                    });
                    return;
                }
            }
            
            // Préparation des données
            const orderData = {
                product_name: 'Poulet braisé',
                CodeCommande: 'CMD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                quantity: quantity,
                unit_price: unitPrice,
                delivery_fee: DELIVERY_FEE,
                subtotal: parseInt(hiddenSubtotal.value),
                total: (unitPrice * quantity) + DELIVERY_FEE,
                delivery_address: deliveryAddress,
                contact_phone: contactPhone,
                promo_code: promoCode || null,
                order_date: new Date().toISOString(),
                visit_count: localStorage.getItem('visitCount') || 1
            };
            
            // Afficher loader
            Swal.fire({
                title: 'Traitement de la commande...',
                text: 'Veuillez patienter',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            try {
                const response = await fetch('/api/actionCommande', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Commande validée !',
                        html: `
                            <div class="text-start">
                                <p><strong>N° commande:</strong> ${result.order.CodeCommande}</p>
                                <p><strong>Montant total:</strong> ${formatPrice((unitPrice * quantity) + DELIVERY_FEE)}</p>
                                <p><strong>Lieu de livraison:</strong> ${deliveryAddress}</p>
                                <p class="mt-2">Un commercial vous contactera pour validation dans quelques minutes.</p>
                            </div>
                        `,
                        confirmButtonColor: '#FF6B00',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        orderForm.reset();
                        currentQuantity = 1;
                        updateOrderSummary();
                        window.location.href = '/Commande';
                    });
                } else {
                    throw new Error(result.message || 'Erreur lors de l\'enregistrement');
                }
                
            } catch (error) {
                console.error('Erreur:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.message || 'Une erreur est survenue lors de la validation de la commande',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
        
        // Initialisation
        updateOrderSummary();
        
        // Animation des boutons
        const allCountBtns = document.querySelectorAll('.count-btn');
        allCountBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (!this.id) return;
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
        
        // Formatage du téléphone
        const contactInput = document.getElementById('contactPhone');
        contactInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            if (value.length === 10) {
                e.target.value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
            } else {
                e.target.value = value;
            }
        });

        // Formatage du code promo à la volée (majuscule, format fixe)
        const promoInput = document.getElementById('promoCode');
        promoInput.addEventListener('input', (e) => {
            let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            // on attend 1 lettre + 2 lettres + 3 chiffres -> 6 caractères "bruts"
            if (raw.length > 6) raw = raw.slice(0, 6);

            // extraire composants et forcer types
            const letter = raw.slice(0, 1).replace(/[^A-Z]/g, '');
            const letters = raw.slice(1, 3).replace(/[^A-Z]/g, '');
            const digits = raw.slice(3, 6).replace(/[^0-9]/g, '');

            let formatted = '';
            if (letter) formatted += letter;
            if (letters.length > 0) formatted += '-' + letters;
            if (digits.length > 0) formatted += '-' + digits;

            e.target.value = formatted;
        });

