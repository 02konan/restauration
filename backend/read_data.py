from backend.data_base import connexion
from backend.Models import User


def get_user_id(user_id):
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                sql = """
                SELECT utilisateurs.id, id_role, nom, email, nom_roles
                FROM utilisateurs 
                JOIN role ON utilisateurs.id_role = role.id
                WHERE utilisateurs.id = %s;
                """
                cursor.execute(sql, (user_id,))
                row = cursor.fetchone()
                if row:
                    return User(row[0], row[1], row[2], row[3], row[4])
                return None
    except Exception as e:
        return f"erreur get_user_id: {e}"

def liste_commandes():
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
               SELECT 
    clients.nom,
    clients.telephone,
    commandes.id AS id_commande,
    produits.nom AS produits,
    produits.id AS id_produit,
    commandes.statut,
    commandes.Numcode,
    commandes.code,
    ligne_commandes.quantite,
    ligne_commandes.Total,
    commandes.date_commande AS date_commande,
    commandes.Commune AS lieu
FROM ligne_commandes
JOIN produits ON ligne_commandes.id_produit = produits.id
JOIN commandes ON ligne_commandes.id_commande = commandes.id
JOIN clients ON commandes.id_client = clients.id
WHERE commandes.statut != "livree"
ORDER BY commandes.Numcode DESC;
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

def get_maquis_by_code(code):
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, nom, code FROM maquis WHERE code = %s", (code,))
                row = cursor.fetchone()
                if row:
                    return {'id': row[0], 'nom': row[1], 'code': row[2]}
                return None
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