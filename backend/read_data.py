from backend.data_base import connexion
def liste_commandes():
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                SELECT clients.nom,clients.telephone,produits.nom as produits,produits.id as id_produit,commandes.statut,commandes.Numcode,commandes.code,ligne_commandes.quantite,ligne_commandes.Total,commandes.date_commande as date_commande
                FROM ligne_commandes
                JOIN produits on ligne_commandes.id_produit=produits.id
                JOIN commandes on ligne_commandes.id_commande=commandes.id
                JOIN clients on commandes.id_client=clients.id
                ORDER BY commandes.Numcode DESC
                               """)
                commandes = cursor.fetchall()
                return commandes
           
    except Exception as e:
        print(f"Erreur lors de la récupération des commandes: {e}")
        return []