import requests
url = "https://7107.api.greenapi.com/waInstance7107589182/sendMessage/380875c73be84abca41d3a75948e0932897d6c3d711b4dc483"

def Message(numero,date,numCmd,montant,lieu):
    try:
        payload = {
        "chatId": f"{numero} @c.us", 
        "message": f"Votre commande a été bien enrégistrée.\n\n*Date*: {date}\n*N°commande*: {numCmd}\n*Montant total*: {montant} FCFA\n*Lieu de livraison*: {lieu} \n\nUn commercial vous contactera pour validation dans quelques minutes.",  
        "customPreview": {
        }
        }
        headers = {
        'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)

        print(response.text.encode('utf8'))
    except Exception as e:
        return f""