from backend.data_base import connexion

def liste_commandes():
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                SELECT clients.nom,clients.telephone,commandes.id as id_commande,produits.nom as produits,produits.id as id_produit,commandes.statut,
                commandes.Numcode,commandes.code,
                ligne_commandes.quantite,ligne_commandes.Total,commandes.date_commande as date_commande,commandes.Commune as lieu
                FROM ligne_commandes
                JOIN produits on ligne_commandes.id_produit=produits.id
                JOIN commandes on ligne_commandes.id_commande=commandes.id
                JOIN clients on commandes.id_client=clients.id
                ORDER BY commandes.Numcode DESC
                               """)
                commandes = cursor.fetchall()
                return commandes
           
    except Exception as e:
        return (f"Erreur lors de la récupération des commandes: {e}")

def get_maquis_code(maquis_id):
    try:
       with connexion() as conn:
           with conn.cursor() as cursor:
                cursor.execute("SELECT code FROM maquis WHERE id = %s", (maquis_id,))
                row = cursor.fetchone()
                code = row[0] if row else None
                return code
    except Exception as e:
        return None

def read_commission(maquis_id):
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                sql="""
                 SELECT 
                commandes.id AS id_commande,
                produits.nom AS nom_produit,
                300 * ligne_commandes.quantite AS commission,
                commandes.date_commande,
                ligne_commandes.quantite
            FROM 
                commandes 
            JOIN 
                ligne_commandes ON commandes.id = ligne_commandes.id_commande 
            JOIN 
                produits ON ligne_commandes.id_produit = produits.id
            JOIN 
                maquis ON commandes.code = maquis.code
            WHERE 
                maquis.id = %s
            ORDER BY 
                commandes.date_commande DESC
                """
                
                cursor.execute(sql, (maquis_id,))
                rows = cursor.fetchall()
        return rows
        
    except Exception as e:
        return (f"Erreur lors de la lecture des commissions: {e}")