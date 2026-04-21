import requests
import os
from dotenv import load_dotenv
load_dotenv()

def Message(numero_client,numero_patenaire,date,numCmd,montant,lieu,qty,code):
    url =os.getenv("GRENN_API")
    try:
    
            headers = {
                'Content-Type': 'application/json'
            }

            responses = []


            if numero_client:
                message_client = (
                    f"Votre Commande a été bien enregistrée.\n\n"
                    f"*Date*: {date}\n"
                    f"*N°commande*: {numCmd}\n"
                    f"*Quantité*: {qty}\n"
                    f"*Code maquis*: {code}\n"
                    f"*Montant total*: {montant} FCFA\n"
                    f"*Lieu de livraison*: {lieu}\n\n"
                    f"Un Commercial vous contactera pour validation."
                )

                payload_client = {
                    "chatId": f"{numero_client}@c.us",
                    "message": message_client,
                    "customPreview": {
                        "title": "BonPoulet - Nouvelle Commande",
                        "description": f"Commande #{numCmd}"
                    }
                }

                response = requests.post(url, json=payload_client, headers=headers)
                responses.append({"client": response.text})

            if numero_patenaire:
                message_partenaire = (
                    f"Bonne nouvelle ! Quelqu'un vient d'acheter avec votre code — vous venez de gagner !\n\n"
                    f"*Date*: {date}\n"
                    f"*N°commande*: {numCmd}\n"
                    f"*Quantité*: {qty}\n"
                    f"*Commission*: {qty*300}\n"
                    f"Chaque achat avec votre code vous rapporte. Partagez sans limite."
                )

                payload_partenaire = {
                    "chatId": f"{numero_patenaire}@c.us",
                    "message": message_partenaire,
                    "customPreview": {
                        "title": "Nouvelle commande",
                        "description": f"Commande #{numCmd}"
                    }
                }

                response = requests.post(url, json=payload_partenaire, headers=headers)
                responses.append({"partenaire": response.text})

           
    except Exception as e:
     return f"reussit{e}"
    
