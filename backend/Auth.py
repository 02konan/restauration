from backend.data_base import connexion

def  Authentification(email,mpd):
   try:
        with connexion() as conn:
         with conn.cursor() as cursor:
            sql="""
            SELECT utilisateurs.id, id_role, nom, email, nom_roles
            FROM utilisateurs 
            JOIN role on utilisateurs.id_role=role.id
            WHERE email=%s AND mot_de_passe=%s;
            """
            cursor.execute(sql,(email,mpd))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0],
                    "id_role": row[1],
                    "nom": row[2],
                    "email": row[3],
                    "nom_roles": row[4]
                }
            return print("reusit")
   except Exception as e:
       return print(e)
