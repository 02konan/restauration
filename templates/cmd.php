<?php 
include('./includes/header.php');
require_once('./config/database.php');

// // Vérifier si l'utilisateur est connecté
// $is_logged_in = isset($_SESSION['auth']) && $_SESSION['auth'] == true;
// $commandes = [];

// if ($is_logged_in) {
//     $client_id = $_SESSION['client_id'];
    
//     try {
//         // Récupérer les commandes du client connecté
//         $query = "SELECT c.*, m.nom as nom_maquis, m.code as code_promo_maquis 
//                   FROM commandes c
//                   LEFT JOIN maquis m ON c.id_maquis = m.id
//                   WHERE c.id_client = :client_id
//                   ORDER BY c.date_commande DESC";
        
//         $stmt = $bd->prepare($query);
//         $stmt->bindParam(':client_id', $client_id);
//         $stmt->execute();
        
//         $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
//     } catch (PDOException $e) {
//         // Gestion silencieuse de l'erreur
//         $commandes = [];
//     }
// }

// // Fonction pour formater la date
// function formatDate($date) {
//     if (empty($date)) return 'Date inconnue';
    
//     $timestamp = strtotime($date);
//     $now = time();
//     $diff = $now - $timestamp;
    
//     if ($diff < 86400) {
//         return 'Aujourd\'hui';
//     } elseif ($diff < 172800) {
//         return 'Hier';
//     } else {
//         return date('d M Y', $timestamp);
//     }
// }

// // Fonction pour obtenir la classe CSS du statut
// function getStatusClass($statut) {
//     switch ($statut) {
//         case 'en_attente':
//             return 'dot-pending';
//         case 'confirmee':
//             return 'dot-warning';
//         case 'en_preparation':
//             return 'dot-info';
//         case 'prete':
//             return 'dot-primary';
//         case 'livree':
//             return 'dot-success';
//         case 'annulee':
//             return 'dot-danger';
//         default:
//             return 'dot-pending';
//     }
// }

// // Fonction pour obtenir l'icône du statut
// function getStatusIcon($statut) {
//     switch ($statut) {
//         case 'en_attente':
//             return 'bi-dash-circle-fill';
//         case 'confirmee':
//             return 'bi-check-circle-fill';
//         case 'en_preparation':
//             return 'bi-arrow-repeat';
//         case 'prete':
//             return 'bi-cup-straw';
//         case 'livree':
//             return 'bi-check-circle-fill';
//         case 'annulee':
//             return 'bi-x-circle-fill';
//         default:
//             return 'bi-dash-circle-fill';
//     }
// }

// // Fonction pour obtenir le libellé du statut
// function getStatusLabel($statut) {
//     switch ($statut) {
//         case 'en_attente':
//             return 'En attente';
//         case 'confirmee':
//             return 'Confirmée';
//         case 'en_preparation':
//             return 'En préparation';
//         case 'prete':
//             return 'Prête';
//         case 'livree':
//             return 'Livrée';
//         case 'annulee':
//             return 'Annulée';
//         default:
//             return 'En attente';
//     }
// }
?>

<div class="container-fluid d-flex">
    <?php if(isset($_SESSION['user_nom'])) :?> 
        <p class="text-muted ms-auto user">
            👋 <?= htmlspecialchars($_SESSION['user_nom'])?>
        </p>
    <?php else : ?>
        <a href="./login.php">Se connecter</a>
    <?php endif; ?>
</div>

<div class="container-fluid p-0 banner">
    <h1>DU BON POULET BRAISÉ POUR VOUS</h1>
    <!-- <a href="./form-commande.php" class="btn btn-custom-primary rounded-pill">
        Commandez <i class="bi bi-arrow-right-circle-fill ms-3"></i>
    </a> -->
    <img src="./assets/back/back0.png" alt="">
</div>

<div class="d-flex justify-content-between align-items-center my-3 subtitle">
    <h4 class="fw-bold">Mes commandes</h4>
    <span class="text-muted" id="totalResults">
        
    </span>
</div>

<form action="" class="d-flex align-items-center px-3 py-2 rounded-pill animation-slide" id="searchForm">
    <i class="bi bi-search me-2"></i>
    <input type="text" class="" placeholder="Recherche..." id="searchInput" name="searchInput">
</form>

<div class="d-flex gap-2 mt-2 filter-pills animation-slide" id="filterPills">
    <button type="button" class="btn btn-sm rounded-pill filter-pill active" data-filter="">Tous</button>
    <button type="button" class="btn btn-sm rounded-pill filter-pill" data-filter="en_preparation">Traiter</button>
    <button type="button" class="btn btn-sm rounded-pill filter-pill" data-filter="livree">Livrée</button>
</div>

<div class="container-fluid p-0 d-flex flex-column gap-2 list-commande" id="result-commande">
    
</div>
<audio id="notificationSound" src="./bip.wav" preload="auto"></audio>

<style>
.order-item {
    transition: transform 0.2s;
}
.order-item:hover {
    transform: translateY(-2px);
}
.dot {
    font-size: 1.2rem;
}
.dot-pending {
    color: #ffc107;
}
.dot-warning {
    color: #fd7e14;
}
.dot-info {
    color: #0dcaf0;
}
.dot-primary {
    color: #0d6efd;
}
.dot-success {
    color: #198754;
}
.dot-danger {
    color: #dc3545;
}
.border-top {
    border-color: #e9ecef !important;
}
#searchForm{
    background: var(--cream);
}
#searchForm input{
    background: transparent;
    border: none;
    outline: none;
}

/* Filter pills */
.filter-pills {
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}
.filter-pills::-webkit-scrollbar { display: none; }
.filter-pill {
    white-space: nowrap;
    border: 1.5px solid #C0392B;
    color: var(--text-color);
    background: var(--white);
    font-size: 12px;
    padding: 4px 14px;
    transition: all 0.2s;
}
.filter-pill.active,
.filter-pill:hover {
    background: #C0392B;
    color: #fff;
}

/* Context menu dropdown */
.context-menu {
    position: fixed;
    z-index: 9999;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    min-width: 180px;
    overflow: hidden;
    animation: contextFadeIn 0.15s ease;
}
@keyframes contextFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
}
.context-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    font-size: 13px;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    color: #1C1C1C;
    transition: background 0.15s;
}
.context-menu-item:hover { background: #FFF5E1; }
.context-menu-item.danger { color: #C0392B; }
.context-menu-item + .context-menu-item {
    border-top: 1px solid #f0f0f0;
}
</style>
<script>
    // Variables globales
    let currentPage = 1;
    let currentFilters = new FormData();
    let resultsPerPage = 10;
    let searchTimeout;
    let activeFilter = '';

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
        fetchResults('', 'result-commande', './api/actionAdminCommande.php', currentPage);

        // Écouteur recherche avec debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentPage = 1;
                    fetchResults('searchForm', 'result-commande', './api/actionAdminCommande.php', currentPage);
                }, 500);
            });
        }

        // Écouteurs filtre statut (pills)
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                activeFilter = this.dataset.filter;
                currentPage = 1;
                fetchResults('searchForm', 'result-commande', './api/actionAdminCommande.php', currentPage);
            });
        });

        // Fermer le menu contextuel en cliquant ailleurs
        document.addEventListener('click', closeContextMenu);
        document.addEventListener('scroll', closeContextMenu, true);

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

        console.info('Script all-commandes chargé, audio', audio ? 'trouvé' : 'introuvable');
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

    // ── Context menu ──────────────────────────────────────
    let contextMenuTarget = null;

    function showContextMenu(e, commandeId, commandeStatut) {
        e.preventDefault();
        closeContextMenu();

        contextMenuTarget = { id: commandeId, statut: commandeStatut };

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.id = 'contextMenu';

        menu.innerHTML = `
            <button class="context-menu-item" onclick="handleContextAction('details', ${commandeId})">
                <i class="bi bi-eye"></i> Détails
            </button>
            <button class="context-menu-item" onclick="handleContextAction('traiter', ${commandeId})">
                <i class="bi bi-arrow-repeat"></i> Traiter
            </button>
            <button class="context-menu-item danger" onclick="handleContextAction('livree', ${commandeId})">
                <i class="bi bi-check-circle-fill"></i> Livrée
            </button>
        `;

        // Positionner le menu
        const x = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;

        menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
        menu.style.top  = Math.min(y, window.innerHeight - 160) + 'px';

        document.body.appendChild(menu);
    }

    function closeContextMenu() {
        const existing = document.getElementById('contextMenu');
        if (existing) existing.remove();
        contextMenuTarget = null;
    }

    function handleContextAction(action, commandeId) {
        closeContextMenu();
        if (action === 'details') {
            // Ouvrir détails — à adapter selon votre routing
            console.log('Détails commande', commandeId);
            // window.location.href = './detail-commande.php?id=' + commandeId;
        } else if (action === 'traiter') {
            updateStatutCommande(commandeId, 'en_preparation');
        } else if (action === 'livree') {
            updateStatutCommande(commandeId, 'livree');
        }
    }

    function updateStatutCommande(commandeId, statut) {
        const formData = new FormData();
        formData.append('action', 'updateStatut');
        formData.append('id', commandeId);
        formData.append('statut', statut);
        const telephone = localStorage.getItem('telephone');
        if (telephone) formData.append('telephone', telephone);

        fetch('./api/actionAdminCommande.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    fetchResults('searchForm', 'result-commande', './api/actionAdminCommande.php', currentPage);
                } else {
                    alert(data.message || 'Erreur lors de la mise à jour');
                }
            })
            .catch(() => alert('Erreur réseau'));
    }

    // Formater la date côté JS (équivalent PHP formatDate)
    function formatDateJS(dateStr) {
        if (!dateStr) return 'Date inconnue';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 86400) return "Aujourd'hui";
        if (diff < 172800) return 'Hier';

        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // Fonction pour récupérer les résultats
    function fetchResults(formId, resultsId, endpoint, page = 1) {
        let formData;
        
        if (formId !== '') {
            const form = document.getElementById(formId);
            formData = new FormData(form);
        } else {
            formData = new FormData();
        }

        // Ajouter le terme de recherche si présent
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim() !== '') {
            formData.append('search', searchInput.value.trim());
        }

        // // Ajouter le téléphone depuis le localStorage pour identifier le client
        // const telephone = localStorage.getItem('telephone');
        // if (telephone) {
        //     formData.append('telephone', telephone);
        // }

        // Ajouter le filtre de statut actif
        if (activeFilter) {
            formData.append('statut_filter', activeFilter);
        }
        
        // Sauvegarder les filtres actuels
        currentFilters = formData;
        
        const action = 'getCommandes';
        
        // Ajouter la page courante
        formData.append('page', page);
        formData.append('action', action);
        
        fetch(endpoint, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur :", data);
            
            // Mettre à jour le total
            const totalResultsElement = document.getElementById('totalResults');
            if (totalResultsElement) {
                totalResultsElement.textContent = `${data.totalResults > 0 && data.totalResults < 10 ? '0'+data.totalResults+' Commandes' : data.totalResults+' commandes'}`;
            }
            
            const tableBody = document.getElementById(resultsId);
            if (!tableBody) {
                console.error("Table body non trouvé");
                return;
            }
            
            tableBody.innerHTML = '';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(commande => {
                    const row = document.createElement('div');
                    row.className = "order-item shadow-sm";

                    // Statut → classe CSS, icône, libellé
                    let statusClass = '';
                    let statusIcon = '';
                    let statusText = '';

                    switch(commande.statut) {
                        case 'en_attente':
                            statusClass = 'dot-pending';
                            statusIcon = 'bi-clock-history';
                            statusText = 'En attente';
                            break;
                        case 'confirmee':
                            statusClass = 'dot-warning';
                            statusIcon = 'bi-check-circle-fill';
                            statusText = 'Confirmée';
                            break;
                        case 'en_preparation':
                            statusClass = 'dot-info';
                            statusIcon = 'bi-arrow-repeat';
                            statusText = 'En préparation';
                            break;
                        case 'prete':
                            statusClass = 'dot-primary';
                            statusIcon = 'bi-cup-straw';
                            statusText = 'Prête';
                            break;
                        case 'livree':
                            statusClass = 'dot-success';
                            statusIcon = 'bi-check-circle-fill';
                            statusText = 'Livrée';
                            break;
                        case 'annulee':
                            statusClass = 'dot-danger';
                            statusIcon = 'bi-x-circle-fill';
                            statusText = 'Annulée';
                            break;
                        default:
                            statusClass = 'dot-pending';
                            statusIcon = 'bi-dash-circle-fill';
                            statusText = 'En attente';
                    }

                    // Formatage de la date
                    const dateFormatee = formatDateJS(commande.date_commande);

                    // Formatage du total
                    const totalFormate = Number(commande.total).toLocaleString('fr-FR') + ' F';

                    // Footer conditionnel selon statut
                    let footer = '';
                    if (commande.statut === 'en_attente') {
                        footer = `<div class="mt-2 pt-2 border-top">
                            <small class="text-warning">
                                 Nouvelle commande
                            </small>
                        </div>`;
                    }else if (commande.statut === 'en_preparation') {
                        footer = `<div class="mt-2 pt-2 border-top">
                            <small class="text-info">
                                En preparation
                            </small>
                        </div>`;
                    } else if (commande.statut === 'livree') {
                        footer = `<div class="mt-2 pt-2 border-top">
                            <small class="text-success">
                                Livrée le ${dateFormatee}
                            </small>
                        </div>`;
                    }

                    row.innerHTML = `
                        <div class="content w-100 d-flex gap-3">
                            <div class="image">
                                <img src="./assets/back/back0.png" alt="Poulet braisé">
                            </div>
                            <div class="text d-flex flex-column flex-grow-1">
                                <div class="d-flex align-items-center gap-2">
                                    <h3 class="mb-0">Poulet braisé</h3>
                                    <span class="dot ${statusClass}" title="${statusText}">
                                        <i class="bi ${statusIcon}"></i>
                                    </span>
                                </div>
                                <div class="small text-muted desc mt-2">
                                    <span class="badge rounded-pill">${commande.adresse}</span>
                                    <span class="badge rounded-pill">${commande.telephone ? commande.telephone : commande.client_telephone}</span>
                                </div>
                                <div class="price-tag mt-auto">${totalFormate}</div>
                            </div>
                            <div class="d-flex flex-column justify-content-between ms-auto mt-2 infos">
                                <p class="small text-muted date mb-1">${dateFormatee}</p>
                                <p class="quantity ms-auto mb-0">${commande.quantite}</p>
                            </div>
                        </div>
                        ${footer}
                    `;

                    // Context menu : clic droit desktop + maintien mobile
                    let pressTimer;
                    row.addEventListener('contextmenu', (e) => showContextMenu(e, commande.id, commande.statut));
                    row.addEventListener('touchstart', (e) => {
                        pressTimer = setTimeout(() => {
                            const touch = e.touches[0];
                            showContextMenu({ preventDefault: () => {}, clientX: touch.clientX, clientY: touch.clientY }, commande.id, commande.statut);
                        }, 600);
                    }, { passive: true });
                    row.addEventListener('touchend', () => clearTimeout(pressTimer));
                    row.addEventListener('touchmove', () => clearTimeout(pressTimer));

                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `
                    <div class="order-item shadow-sm d-flex flex-column justify-content-center align-items-center" style="height: 50vh !important;">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="text-muted mt-2 mb-0">Aucune commande Trouvée</p>
                    </div>`;
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            const tableBody = document.getElementById(resultsId);
            if (tableBody) {
                tableBody.innerHTML = `
                    <div class="order-item shadow-sm d-flex flex-column justify-content-center align-items-center" style="height: 50vh !important;">
                        <i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
                        <p class="text-danger mt-2 mb-0">Erreur de chargement des commandes</p>
                    </div>`;
            }
        });
    }
    // Polling pour vérifier les nouvelles commandes toutes les 3 secondes
    let previousCommandCount = null;

    setInterval(() => {
        const formData = new FormData();
        formData.append('action', 'numberCommandes');

        fetch('./api/actionAdminCommande.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const currentCount = data.number;
                if (previousCommandCount !== null && currentCount !== previousCommandCount) {
                    playNotificationSound();
                    fetchResults('searchForm', 'result-commande', './api/actionAdminCommande.php', currentPage);
                }
                previousCommandCount = currentCount;
            } else {
                console.warn('Polling commandes : réponse non succès', data);
            }
        })
        .catch(error => console.error('Erreur lors du polling des commandes:', error));
    }, 3000);
</script>
<?php include('./includes/footer.php') ?>