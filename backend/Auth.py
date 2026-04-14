# from backend.data_base import connexion

# def  Authentification(email,mpd):
#    try:
#         with connexion() as conn:
#          with conn.cursor() as cursor:
#             sql="SELECT `nom`, `email`, FROM utilisateurs WHERE email=%s AND mot_de_passe=%s"
#             cursor.execute(sql,(email,mpd))
#             return cursor.fetchall()
#    except Exception as e:
#        return f"Erreur serveur"        