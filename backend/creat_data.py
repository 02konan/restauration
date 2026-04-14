from backend.data_base import connexion

def create_commande(nom, telephone,Numcode ,code, statut,commune,prix_unitaire,quantite, total):
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                sql_client = "INSERT INTO `clients`( `nom`, `telephone`) VALUES (%s, %s)"
                cursor.execute(sql_client, (nom, telephone))
                id_client = cursor.lastrowid
                
                sql_commande = "INSERT INTO `commandes`(`id_client`, `Numcode`,`code`,`Commune`, `statut`) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql_commande, (id_client, Numcode, code, commune, statut))
                id_commande = cursor.lastrowid

                sql_details = "INSERT INTO `ligne_commandes`(`id_commande`, `id_produit`, `quantite`, `prix_unitaire`, `Total`) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql_details, (id_commande, 1, quantite, prix_unitaire, total))

            conn.commit()
            return {"success": True, "id_commande": id_commande}
    except Exception as e:
        error_message = str(e)
        print(f"An error occurred: {error_message}")
        return {"success": False, "error": error_message}

def update_commande(id_commande, status,id_utilisateur=4):
    try:
        with connexion() as conn:
            with conn.cursor() as cursor:
                sql = "UPDATE `commandes` SET `statut` = %s, `date_modification` = NOW() WHERE `id` = %s"
                updatecommande=cursor.execute(sql, (status, id_commande))
                if(updatecommande and status=="livree" ):
                    sql_valider = "INSERT INTO valider(`id_commande`, `id_utilisateur`) VALUES(%s, %s)"
                    cursor.execute(sql_valider, (id_commande,id_utilisateur))

            conn.commit()
            return {"success": True}
    except Exception as e:
        error_message = str(e)
        return {"success": False, "error": error_message}