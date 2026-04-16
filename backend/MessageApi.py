import requests
def Message(numero,date,numCmd,montant,lieu):
    try:
        url ="{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}"
        payload = {
        "chatId": f"{numero}@c.us", 
        "message": f"Votre commande a été bien enrégistrée.\n\n*Date*: {date}\n*N°commande*: {numCmd}\n*Montant total*: {montant} FCFA\n*Lieu de livraison*: {lieu} \n\nUn commercial vous contactera pour validation dans quelques minutes.",  
        "customPreview": {
            "title": "BonPoulet - Confirmation",
            "description": f"Commande #{numCmd}"
        }
        }
        headers = {
        'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)

        print(f"Status: {response.status_code}")
        
    except Exception as e:
        return f"reussit{e}"