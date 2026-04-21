document.addEventListener("DOMContentLoaded", () => {
    commandeClient()
    setInterval(commandeClient,5000)
     const audio = document.getElementById('notificationSound');
        if (audio) {
            audio.volume = 1;
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

 function playNotificationSound() {
        const audio = document.getElementById('notificationSound');
        if (!audio) {
            console.warn('Balise audio notificationSound introuvable.');
            return;
        }

        console.info('Lecture du son de notification');
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.warn('Notification audio bloquée ou indisponible :', error);
        });
    }
let previousCommandCount = null;

function commandeClient() {
    fetch("/commande-client")
    .then(res => res.json())
    .then(response => {
        const currentCount = response.count;
                if (previousCommandCount !== null && currentCount !== previousCommandCount) {
                    playNotificationSound();
                    
                }
                previousCommandCount = currentCount;
                taille=document.getElementById("totalResults").textContent=currentCount+' '+"Commandes"
        afficheCommande(response.data)

    })
}

function afficheCommande(commande) {
    const container = document.getElementById("result-commande")
    container.innerHTML = "";

    initializeDetailsModal();

    commande.forEach(cmd => {

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
            <div class="content w-100 d-flex gap-3">
                <div class="image">
                    <img src="static/back/back0.png" alt="Poulet braisé">
                </div>
                <div class="text d-flex flex-column flex-grow-1">
                    <div class="d-flex align-items-center gap-2">
                        <h3 class="mb-0">${cmd.produits}</h3>
                        <span class="dot ${classe}" title="${cmd.status}">
                            <i class="bi ${icon}"></i>
                        </span>
                    </div>
                    <div class="small text-muted desc mt-2">
                        Du bon poulet braisé accompagné d'une boule d'attitété
                    </div>
                    <div class="price-tag mt-auto">${cmd.Total}</div>
                </div>
                <div class="d-flex flex-column justify-content-between ms-auto mt-2 infos">
                    <p class="small text-muted date mb-1">${dateFormatee}</p>
                    <p class="quantity ms-auto mb-0">${cmd.quantite}</p>
                </div>
            </div>
            <div class="mt-2 pt-2 border-top">
                <small class="${couleur}">
                    ${cmd.status}
                </small>
            </div>
        `;

        item.addEventListener("click", () => fillDetailsModal(cmd));
        container.appendChild(item);
    });
}

function initializeDetailsModal() {
    let details = document.getElementById("detailsModal");
    if (!details) {
        details = document.createElement("div");
        details.id = "detailsModal";
        details.className = "modal fade";
        details.setAttribute("tabindex", "-1");
        document.body.appendChild(details);
    }
    if (!details.querySelector('.modal-dialog')) {
        details.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div class="modal-content">
                    <div class="modal-header py-2">
                        <div>
                            <h5 class="modal-title">Details</h5>
                            <p class="small text-muted">Toutes les informations de la commande</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editForm" method="POST" action="/Dashboard">
                            <input type="hidden" name="id" id="editId">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Date</label>
                                    <p class="m-0" id="detailDate"></p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Code commande</label>
                                    <p class="m-0" id="detailCode"></p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Client</label>
                                    <p class="text-uppercase m-0" id="detailClient"></p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Lieu</label>
                                    <p class="text-uppercase m-0" id="detailLieu"></p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Code promo</label>
                                    <p class="text-uppercase m-0" id="detailPromo"></p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Contact</label>
                                    <p class="text-uppercase m-0" id="detailContact"></p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Nombre de poulet</label>
                                    <p class="text-uppercase m-0" id="detailQuantite"></p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Prix total</label>
                                    <p class="text-uppercase m-0" id="detailTotal"></p>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" id="detailsModalFooter">
                    <form method="POST" action="/Dashboard" class="d-flex gap-2 mb-0">
                        <input type="hidden" name="id_commande" id="detailOrderIdTraiter">
                        <input type="hidden" name="date_commande" id="detaildatedLivrer">
                        <input type="hidden" name="Traiter" value="Enpreparation">
                        <button type="submit" class="btn btn-custom-secondary">Traiter</button>
                    </form>
                    <form method="POST" action="/Dashboard" class="d-flex gap-2 mb-0">
                        <input type="hidden" name="id_commande" id="detailOrderIdLivrer">
                        <input type="hidden" name="date_commande" id="detaildatedLivrer">
                        <input type="hidden" name="Livrer" value="livree">
                        <button type="submit" class="btn btn-custom-primary">Livrer</button>
                    </form>
                    <form method="POST" action="/Dashboard" class="d-flex gap-2 mb-0">
                        <input type="hidden" name="id_commande" id="detailOrderIdTraiter">
                        <input type="hidden" name="date_commande" id="detaildatedLivrer">
                        <input type="hidden" name="Annuler" value="1">
                        <button type="submit" class="btn btn-primary">Annuler</button>
                    </form>
                    </div>
                </div>
            </div>
        `;
    }
   
}

function fillDetailsModal(cmd) {
    const dateObj = new Date(cmd.date_commande);
    const dateFormatee = dateObj.toLocaleString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById("detailDate").textContent = dateFormatee;
    document.getElementById("detailCode").textContent = cmd.Numcommande || cmd.id || "N/A";
    document.getElementById("detailClient").textContent = cmd.Client || cmd.user || "Client inconnu";
    document.getElementById("detailLieu").textContent = cmd.lieu || cmd.adresse || "Inconnu";
    document.getElementById("detailPromo").textContent = cmd.code || cmd.promo || "Aucun";
    document.getElementById("detailContact").textContent = cmd.telephone || cmd.contact || "N/A";
    document.getElementById("detailQuantite").textContent = cmd.quantite || "0";
    document.getElementById("detailTotal").textContent = cmd.Total || "0";
    document.getElementById("detailOrderIdTraiter").value = cmd.id_commande || cmd.id_produits || "";
    document.getElementById("detailOrderIdLivrer").value = cmd.id_commande || cmd.id_produits || "";

    const footer = document.getElementById("detailsModalFooter");
    if (footer) {
        const status = (cmd.status || "").toString().toLowerCase();
        footer.style.display = status.includes("livré") || status.includes("livree") ? "none" : "flex";
    }
}
