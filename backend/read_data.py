from backend.data_base import connexion
def liste_commandes():
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM commandes")
                commandes = cursor.fetchall()
                return commandes
           
    except Exception as e:
        print(f"Erreur lors de la récupération des commandes: {e}")
        return []