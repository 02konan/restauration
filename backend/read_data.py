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
        print(f"Erreur lors de la récupération des commandes: {e}")
        return []

def get_maquis_code(maquis_id):
    """Récupère le code du maquis par ID."""
    try:
        conn = connexion()
        cursor = conn.cursor()
        cursor.execute("SELECT code FROM maquis WHERE id = %s", (maquis_id,))
        row = cursor.fetchone()
        code = row[0] if row else None
        return code
    except Exception as e:
        return None
    finally:
        cursor.close()
        conn.close()


def read_commission(maquis_id):
    """Lit les données de la table 'commission' et retourne une liste de dictionnaires."""
    try:
        print("Log: Connexion à la base de données...")
        conn = connexion()
        print("Log: Connexion réussie.")
        cursor = conn.cursor()
        print("Log: Exécution de la requête SQL...")
        cursor.execute("""
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
        """, (maquis_id,))
        print("Log: Requête exécutée, récupération des données...")
        rows = cursor.fetchall()
        print(f"Log: {len(rows)} lignes récupérées.")
        commissions = []
        for row in rows:
            commissions.append({
                'id_commande': row[0],  # Nouveau champ
                'nom_produit': row[1],  # Était row[0] avant
                'commission': row[2],   # Était row[1]
                'date_commande': row[3], # Était row[2]
                'quantite': row[4]      # Était row[3]
            })
        print(f"Log: {len(commissions)} commissions traitées.")
        return commissions
    except Exception as e:
        print(f"Erreur lors de la lecture des commissions: {e}")
        return []
    finally:
        cursor.close()
        conn.close()
        print("Log: Connexion fermée.")
