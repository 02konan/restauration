import requests
def Message(numero,date,numCmd,montant,lieu,qty,code):
    try:
        url ="https://7107.api.greenapi.com/waInstance7107590273/sendMessage/209f0a339a104043b938f7640285205878bc17f52eab4990ab"
        payload = {
        "chatId": f"{numero}@c.us", 
        "message": f"Votre Commande a été bien enregistrée.\n\n*Date*: {date}\n*N°commande*: {numCmd}\n*Quatité*: {qty}\n*Code maquis*: {code}\n*Montant total*: {montant} FCFA\n*Lieu de livraison*: {lieu} \n\n Un Commerciale vous contactera pour validation dans moins d'une minute",  
        "customPreview": {
            "title": "BonPoulet - Nouvelle Commande",
            "description": f"Commande #{numCmd}"
        }
        }
        headers = {
        'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)

        return response.text.encode('utf8')
        
    except Exception as e:
        return f"reussit{e}"