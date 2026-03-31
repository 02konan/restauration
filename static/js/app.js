document.addEventListener("DOMContentLoaded", () => {
    commandeClient()
    setInterval(commandeClient,10000)
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
        if (status === "Nouvelle commande") {
            couleur = "text-warning"
        } else if (status === "En preparation") {
            couleur = "text-info"
        } else {
            couleur = "text-success"
        }

        const item = document.createElement("div")
        item.className = "order-item shadow-sm"

        item.innerHTML = `
        <div class="content w-100 d-flex gap-3">
            <input type="hidden" value="${id_produits}">
            <div class="image">
                <img src="static/back/back0.png" alt="Poulet braisé">
            </div>
            <div class="text d-flex flex-column flex-grow-1">
                <div class="d-flex align-items-center gap-2">
                    <h3 class="mb-0">${produits}</h3>
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
        `

        container.appendChild(item) 
    });
}