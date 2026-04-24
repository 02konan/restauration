

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
        let currentQuantity = 0;
        
        // Éléments DOM
        const displayQuantity = document.getElementById('displayQuantity');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('totalAmount');
        const decrementBtn = document.getElementById('decrementBtn');
        const incrementBtn = document.getElementById('incrementBtn');
        const quantityInput = document.getElementById('quantity');
        
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
            // Vérifier que les éléments existent avant de les modifier
            if (!displayQuantity || !subtotalElement || !totalElement) {
                return;
            }
            
            const subtotal = UNIT_PRICE * currentQuantity;
            const total = subtotal + DELIVERY_FEE;
            
            displayQuantity.textContent = currentQuantity;
            subtotalElement.textContent = formatPrice(subtotal);
            totalElement.textContent = formatPrice(total);
            
            if (hiddenQuantity) hiddenQuantity.value = currentQuantity;
            if (hiddenUnitPrice) hiddenUnitPrice.value = UNIT_PRICE;
            if (hiddenSubtotal) hiddenSubtotal.value = subtotal;
            if (hiddenTotal) hiddenTotal.value = total;
        }
        
        // Événements des boutons
        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => {
                currentQuantity++;
                updateOrderSummary();
            });
        }
        
        if (decrementBtn) {
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
        }
        
        // Événement pour l'input quantité
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
            currentQuantity = parseInt(quantityInput.value);
            console.log(currentQuantity);
            
            if (currentQuantity < 1){
                currentQuantity = 1;
                quantityInput.value = currentQuantity;
            }else if(!currentQuantity){
                currentQuantity = 0;
            }
            

            updateOrderSummary();
        });
        }
        
        // Soumission du formulaire
        const orderForm = document.getElementById('orderForm');
        
       if (orderForm) {
         orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const deliveryAddress = document.getElementById('lieu').value.trim();
            const contactPhone = document.getElementById('contactPhone').value.trim();
            const promoCode = document.getElementById('promoCode').value.trim();
            const quantity = parseInt(hiddenQuantity.value);
            const unitPrice = parseInt(hiddenUnitPrice.value);
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            
            // Validation
            if (!deliveryAddress) {
                Swal.fire({
                    icon: 'error',
                    title: 'Champ manquant',
                    text: 'Veuillez indiquer le lieu de livraison',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }
            // Validation
            if (quantity == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Champ manquant',
                    text: 'Veuillez indiquer la quantité',
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
                const strictPromoRegex = /^[A-Z]{4}\d{4}$/;
                if (!strictPromoRegex.test(promoCode.toUpperCase())) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Code promo invalide',
                        html: 'Le code promo doit être au format <strong>CCOD1002</strong> (8 caractères, 4 lettres suivies de 4 chiffres).',
                        confirmButtonColor: '#dc3545'
                    });
                    return;
                }
            }
            
            // Préparation des données
            const orderData = {
                product_name: 'Poulet braisé',
                CodeCommande: 'CMD-' + new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-'),
                quantity: quantity,
                unit_price: unitPrice,
                delivery_fee: DELIVERY_FEE,
                total: (unitPrice * quantity) + DELIVERY_FEE,
                delivery_address: deliveryAddress,
                contact_phone: contactPhone,
                promo_code: promoCode || null,
                latitude: latitude || null,
                longitude: longitude || null,
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
                                <p><strong>N° commande:</strong>${result.order.CodeCommande}</p>
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
                        window.location.href = '/';
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
       }
        
        // Initialisation
        updateOrderSummary();
        
        // Animation des boutons
        const allCountBtns = document.querySelectorAll('.count-btn');
        allCountBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    if (!this.id) return;
                    this.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            }
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

        // Formatage du code promo à la volée (4 lettres + 4 chiffres)
        const promoInput = document.getElementById('promoCode');
        promoInput.addEventListener('input', (e) => {
            let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (raw.length > 8) raw = raw.slice(0, 8);
            // Séparer les lettres (premiers 4) et chiffres (derniers 4)
            let letters = raw.slice(0, 4).replace(/[^A-Z]/g, '');
            let digits = raw.slice(4, 8).replace(/[^0-9]/g, '');
            e.target.value = letters + digits;
        });

        // Géolocalisation
        const locateBtn = document.getElementById('locate-commande');
        if (locateBtn) {
            const originalIcon = locateBtn.innerHTML;
            locateBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    // Afficher le spinner
                    locateBtn.innerHTML = '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i>Ma Position';
                    locateBtn.disabled = true; // Désactiver le bouton pendant le chargement
                    
                    navigator.geolocation.getCurrentPosition(async (position) => {

                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        let lieu = document.getElementById('lieu').value

                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                            const data = await response.json();
                            const address = data.display_name || lieu;
                            
                            document.getElementById('lieu').value = address;
                            document.getElementById('latitude').value = lat;
                            document.getElementById('longitude').value = lng;
                            
                        } catch (error) {
                            console.error('Erreur de géocodage inverse:', error);
                            document.getElementById('lieu').value = `Latitude: ${lat}, Longitude: ${lng}`;
                            document.getElementById('latitude').value = lat;
                            document.getElementById('longitude').value = lng;
                        } finally {
                            // Restaurer l'icône originale
                            locateBtn.innerHTML = originalIcon;
                            locateBtn.disabled = false;
                        }
                    }, (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur de localisation',
                            text: 'Impossible d\'obtenir votre position.',
                            confirmButtonColor: '#dc3545'
                        });
                        // Restaurer l'icône originale
                        locateBtn.innerHTML = originalIcon;
                        locateBtn.disabled = false;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Géolocalisation non supportée',
                        text: 'Votre navigateur ne supporte pas la géolocalisation.',
                        confirmButtonColor: '#dc3545'
                    });
                }
            });
        }
