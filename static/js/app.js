document.addEventListener("DOMContentLoaded", () => {
    commandeClient()
    setInterval(commandeClient,30000)
});
function commandeClient() {
    fetch("/commande-client")
    .then(res => res.json())
    .then(response => {
        afficheCommande(response.data)
    })
}

function afficheCommande(commande) {
    const container = document.getElementById("result-commande")
    container.innerHTML = "";

    commande.forEach(cmd => {

        let { id_produits, produits, status, quantite, Total,date_commande } = cmd;

        const dateObj = new Date(cmd.date_commande);
        const dateFormatee = dateObj.toLocaleString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric'
       });

        let couleur = "";
        let icon=""
        if (status === "Nouvelle commande") {
            couleur = "text-warning"
            icon="bi-clock-history"
        } else if (status === "En preparation") {
            couleur = "text-info"
            icon="bi-arrow-repeat"
        } else {
            couleur = "text-success"
            icon="bi-check-circle-fill"
        }

        const item = document.createElement("div")
        item.className = "order-item shadow-sm"

        item.innerHTML = `
        <div class="order-item shadow-sm" data-bs-toggle="modal" data-bs-target="#detailsModal">
                <div class="content w-100 d-flex gap-3">
                    <div class="image">
                        <img src="static/back/back0.png" alt="Poulet braisé">
                    </div>
                    <div class="text d-flex flex-column flex-grow-1">
                        <div class="d-flex align-items-center gap-2">
                            <h3 class="mb-0">${produits}</h3>
                            <span class="dot dot-info" title="${status}">
                                <i class="bi ${icon}"></i>
                            </span>
                        </div>
                        <div class="small text-muted desc mt-2">
                            Du bon poulet braisé accompagné d'une boule d'attitété
                        </div>
                        <div class="price-tag mt-auto">${Total}</div>
                    </div>
                    <div class="d-flex flex-column justify-content-between ms-auto mt-2 infos">
                        <p class="small text-muted date mb-1">${dateFormatee}</p>
                        <p class="quantity ms-auto mb-0">${quantite}</p>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-top">
                    <small class="${couleur}">
                        ${status}
                    </small>
                </div>
            </div>
        `
        container.appendChild(item) 

        const details=document.getElementById("detailsModal")
        const item_details=document.createElement("div")
        item_details.className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
        item_details.innerHTML=`
         <div class="modal-content">
                    <div class="modal-header py-2">
                        <div class="">
                            <h5 class="modal-title">Details</h5>
                            <p class="small text-muted">Toutes les informations de la commande</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editForm">
                            <input type="hidden" name="id" id="editId">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Date</label>
                                    <p class=" m-0">12 Mars 2026 à 10:23:55</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Code commande</label>
                                    <p class="m-0">CMD-61467826387-846</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Client</label>
                                    <p class="text-uppercase m-0">user0789147968</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Lieu</label>
                                    <p class="text-uppercase m-0">Abobo</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Code promo</label>
                                    <p class="text-uppercase m-0">Y-CO-001</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Contact</label>
                                    <p class="text-uppercase m-0">0789465738</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Nombre de poulet</label>
                                    <p class="text-uppercase m-0">2</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label" style="color: var(--grey);">Prix total</label>
                                    <p class="text-uppercase m-0">10 000 F</p>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <!-- <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button> -->
                        <button type="button" class="btn btn-custom-secondary" data-bs-dismiss="modal">Traiter</button>
                        <button type="button" class="btn btn-custom-primary" data-bs-dismiss="modal">Livrer</button>
                    </div>
                </div>
        `
        details.appendChild(item_details)

    });
}