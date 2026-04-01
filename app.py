from flask import Flask, render_template, request, jsonify, redirect, url_for
from backend.creat_data import create_commande,update_commande
from backend.read_data import liste_commandes,read_commission,get_maquis_code
import random
app = Flask(__name__)
app_key="Biometricifsm@2025divix_bonpouletmysql-divix.alwaysdata.netdivix"




@app.route("/")
def home():
    return render_template("login.html")

@app.route("/login")
def login():
    return render_template("login.html")

# @app.route("/form-commande")
# def form_commande():
#     return render_template("form-commande.html")

@app.route("/Dashboard",methods=["POST","GET"])
def Page_Dashboard():
    if request.method == "POST":
        status = request.form.get("Traiter") or request.form.get("Livrer")
        id_commande = request.form.get("id_commande")
        update_commande(id_commande, status)
        return redirect(url_for("Page_Dashboard"))
    return render_template("all-commandes.html")

@app.route("/commande-client")
def Page_commande():
    data=liste_commandes()
    table=[]
    if data:
        for i in data:
            table.append({
            "Client":i[0],
            "telephone":i[1],
            "id_commande":i[2],
            "produits":i[3],
            "id_produits":i[4],
            "status":i[5],
            "Numcommande":i[6],
            "code":i[7],
            "quantite":i[8],
            "Total":i[9],
            "date_commande":i[10],
            "lieu":i[11],
            })
            
    return jsonify({
            "succes":True,
            "data":table,
        })
 
@app.route("/Commande")
def commande():
    return render_template("commande.html")

@app.route('/inscriptionPartenaire')
def partenaire():
    return render_template('inscription-partner.html')

@app.route("/api/actionCommande", methods=["POST"])
def api_commandes():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Requête invalide"}), 400

    commune = data.get("delivery_address")
    contact = data.get("contact_phone") or data.get("contactPhone")
    qty = data.get("quantity")
    Numcode = data.get("CodeCommande")
    subtotal = data.get("subtotal")
    total = data.get("total")
    promo = data.get("promo_code") or None
    nom =f"Cli-{random.randint(100, 999)}"  # Générer un nom de client basé sur les derniers chiffres du code de commande
    statut = "Nouvelle commande"
    prix_unitaire = 5000
    

    if not commune or not contact or not qty:
        return jsonify({"error": "Les champs obligatoires sont manquants"}), 400

    result = create_commande(nom, contact, Numcode, promo, statut, commune, prix_unitaire, qty, total)
    if not result.get("success"):
        return jsonify({"error": result.get("error", "Erreur interne")}), 500

    return jsonify({
        "success": True,
        "message": "Commande reçue",
        "order": {
            "commune": commune,
            "contact": contact,
            "CodeCommande": Numcode,
            "qty": qty,
            "promo": promo,
            "subtotal": subtotal,
            "total": total,
            "id_commande": result.get("id_commande"),
        },
    }), 200

@app.route("/commission")
def commission():
    commissions = read_commission(maquis_id= 15)
    unique_commands = len(set(c['id_commande'] for c in commissions))
    total_com = sum(c['commission'] for c in commissions)
    return render_template("commission.html", commissions=commissions, unique_commands=unique_commands, total_com=total_com)

@app.route("/api/commissions")
def api_commissions():
    commissions = read_commission(maquis_id= 15)
    unique_commands = len(set(c['id_commande'] for c in commissions))
    total_com = sum(c['commission'] for c in commissions)
    return jsonify({
        "unique_commands": unique_commands,
        "total_com": total_com,
        "commissions": commissions
    })

@app.route("/code-qr")
def code_qr():
    maquis_code = get_maquis_code(15)
    return render_template("code-qr.html", maquis_code=maquis_code)

@app.route("/profile")
def Page_profile():
    return render_template("profile.html")

@app.route("/carte")
def Page_carte():
    return render_template("cart.html")


if __name__ == "__main__":
    app.run(port=5000,debug=True)
