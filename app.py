from flask import Flask, render_template, request, jsonify, redirect, url_for
from backend.creat_data import create_commande
import random
app = Flask(__name__)


@app.route("/")
def home():
    return render_template("form-commande.html")

@app.route("/Commande")
def commande():
    return render_template("commande.html")

@app.route('/inscriptionPartenaire')
def partenaire():
    """Page d'inscription pour les maquis partenaires IFSM."""
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
    statut = "En Cours"
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


@app.route("/Details")
def about():
    return render_template("recape.html")

if __name__ == "__main__":
    app.run(port=5000,debug=True)
