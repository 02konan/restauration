
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
                        Du bon poulet braisé accompagné d'une boule d'attiéké
                    </div>
                    <div class="price-tag mt-auto">${cmd.Total}</div>
                </div>
                <div class="d-flex flex-column justify-content-between ms-auto mt-2 infos">
                    <p class="small text-muted date mb-1"><strong> ${cmd.lieu} </strong> - ${dateFormatee} </p>
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