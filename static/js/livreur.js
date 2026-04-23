
document.addEventListener("DOMContentLoaded", () => {
    commandelivreur()
    setInterval(commandelivreur,5000)
     const audio = document.getElementById('notificationSound');
        if (audio) {
            audio.volume = 3;
            audio.load();

            const unlockAudio = () => {
                audio.muted = true;
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;
                    console.info('Notification audio déverrouillée');
                }).catch(error => {
                    audio.muted = false;
                    console.warn('Impossible de déverrouiller le son de notification :', error);
                });
            };
            document.addEventListener('click', unlockAudio, { once: true });
            document.addEventListener('keydown', unlockAudio, { once: true });
        }

});

function commandelivreur() {
    fetch("/api/livreur")
    .then(res => res.json())
    .then(response => {
        const currentCount = response.count;
                if (previousCommandCount !== null && currentCount > previousCommandCount) {
                    playNotificationSound();
                    
                }
                previousCommandCount = currentCount;
                taille=document.getElementById("livreuresults").textContent=currentCount+' '+"Commandes"
        affichelivraison(response.data)

    })
}

function affichelivraison(livraison) {
    const container = document.getElementById("result-commande-livreur")
    container.innerHTML = "";

    initializeDetailsModal();

    livraison.forEach(cmd => {

        const dateObj = new Date(cmd.date_commande);
        const dateFormatee = dateObj.toLocaleString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        

        let couleur = "";
        let icon = "";
        let classe = "";
        let Nouvelvaleur="";
        if (cmd.status === "Nouvelle_commande") {
            classe = 'dot-pending'
            couleur = "text-warning";
            icon = "bi-clock-history";
            Nouvelvaleur="Nouvelle commande"
            cmd.status=Nouvelvaleur
        } else if (cmd.status === "Enpreparation") {
            classe = 'dot-info'
            couleur = "text-info";
            icon = "bi-arrow-repeat";
            Nouvelvaleur="En Preparation"
            cmd.status=Nouvelvaleur
        } else {
            classe = 'dot-success'
            couleur = "text-success";
            icon = "bi-check-circle-fill";
        }

        const item = document.createElement("div");
        item.className = "order-item shadow-sm";
        item.setAttribute("data-bs-toggle", "modal");
        item.setAttribute("data-bs-target", "#detailsModal");

            

        item.innerHTML = `
            <div class="order-item shadow-sm" data-bs-toggle="modal" data-bs-target="#detailsModal">
                <div class="content w-100 d-flex gap-3">
                    <div class="image">
                        <img src="static/back/back0.png" alt="Poulet braisé">
                    </div>
                    <div class="text d-flex flex-column flex-grow-1">
                        <div class="d-flex align-items-center gap-2">
                            <h3 class="mb-0">${cmd.produits}</h3>
                            <span class="dot dot ${classe}" title="${cmd.status}">
                                <i class="bi ${icon}"></i>
                            </span>
                        </div>
                        <div class="text-muted desc mt-2">
                            <span class="badge rounded-pill">CMD-24E463-5345435</span>
                        </div>
                        <div class="price-tag mt-auto">${cmd.Total}</div>
                    </div>
                    <div class="d-flex flex-column justify-content-between ms-auto mt-2 infos">
                        <p class="small text-muted date mb-1"><strong> ${cmd.lieu} </strong> - ${dateFormatee} </p>
                        <p class="quantity ms-auto mb-0">${cmd.quantite}</p>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-top d-flex align-items-center">
                    <small class="${couleur}">
                            ${cmd.status}
                    </small>
                    <button class="accept-btn btn btn-sm btn-success rounded-pill ms-auto">Accepter</button>
                </div>
            </div>
        `;

        item.addEventListener("click", () => fillDetailsModal(cmd));
        container.appendChild(item);
    });
}

let acceptBtns = document.querySelectorAll(".accept-btn")
        let cartLivreur = document.getElementById('cart-livreur')
        let listBtn = document.getElementById('list-btn')

        acceptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                cartLivreur.classList.add('hidden')
            })
        })
        listBtn.addEventListener('click', () => {
            cartLivreur.classList.remove('hidden')
        })
        // ── Coordonnées du client (destination) ──────────────────
        const client = {
            lat: 5.360,
            lng: -4.020
        };

        // ── Icônes personnalisées ─────────────────────────────────
        const iconClient = L.divIcon({
            html: '<div style="font-size:28px;line-height:1;">📍</div>',
            className: '',
            iconAnchor: [14, 28],
            popupAnchor: [0, -30]
        });

        const iconLivreur = L.divIcon({
            html: '<div style="font-size:28px;line-height:1;">🛵</div>',
            className: '',
            iconAnchor: [14, 14],
            popupAnchor: [0, -20]
        });

        // ── Initialisation de la carte ────────────────────────────
        const map = L.map('map').setView([client.lat, client.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Marqueur destination client
        const clientMarker = L.marker([client.lat, client.lng], { icon: iconClient })
            .addTo(map)
            .bindPopup('<b>📍 Destination</b><br>Adresse du client')
            .openPopup();

        // Lien GPS (ouvre Google Maps / Waze)
        document.getElementById("gpsLink").href =
            //`https://www.google.com/maps/dir/?api=1&destination=${client.lat},${client.lng}`;
            `https://www.google.com/maps/dir/?api=1&destination=5.348,-4.012`

        // ── Suivi en temps réel du livreur ────────────────────────
        let livreurMarker = null;
        let routingControl = null;

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                function(position) {
                    const livreur = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Mettre à jour ou créer le marqueur livreur
                    if (livreurMarker) {
                        livreurMarker.setLatLng([livreur.lat, livreur.lng]);
                    } else {
                        livreurMarker = L.marker([livreur.lat, livreur.lng], { icon: iconLivreur })
                            .addTo(map)
                            .bindPopup('<b>🛵 Ma position</b>');
                    }

                    // Tracer / mettre à jour l'itinéraire routier
                    if (routingControl) {
                        routingControl.setWaypoints([
                            L.latLng(livreur.lat, livreur.lng),
                            L.latLng(client.lat, client.lng)
                        ]);
                    } else {
                        routingControl = L.Routing.control({
                            waypoints: [
                                L.latLng(livreur.lat, livreur.lng),
                                L.latLng(client.lat, client.lng)
                            ],
                            routeWhileDragging: false,
                            show: false,           // Masquer le panneau texte
                            addWaypoints: false,
                            lineOptions: {
                                styles: [{ color: '#e85d04', weight: 5, opacity: 0.8 }]
                            },
                            createMarker: function() { return null; } // On gère nos propres marqueurs
                        }).addTo(map);
                    }

                    // Adapter la vue pour voir les deux points
                    map.fitBounds([
                        [client.lat, client.lng],
                        [livreur.lat, livreur.lng]
                    ], { padding: [40, 40] });

                    // Envoi position au serveur Flask
                    fetch("/update_position", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(livreur)
                    }).catch(err => console.warn("Envoi position échoué :", err));
                },
                function(error) {
                    console.warn("Géolocalisation refusée ou indisponible :", error.message);
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
        } else {
            console.warn("Géolocalisation non supportée par ce navigateur.");
        }