from dotenv import load_dotenv
import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_cors import CORS
from flask_login import current_user,LoginManager,login_user
from backend.creat_data import create_commande, update_commande
from backend.read_data import liste_commandes, read_commission, get_maquis_code,get_user_id
from backend.MessageApi import Message
from backend.Models import User
from backend.read_data import get_maquis_by_code
from datetime import timedelta,datetime
from backend.Auth import Authentification
import random
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.permanent_session_lifetime= timedelta(minutes=5)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(id_user):
    user = get_user_id(int(id_user))
    return user

@app.before_request
def restriction():
    tab_route = ["home","formcommande","login","login_maquis","api_commandes","livreur","static"] 
    if not (current_user.is_authenticated or session.get('connecter')) and request.endpoint not in tab_route:
        return redirect(url_for("login"))

@app.route("/form-commande")
def formcommande():
    return render_template("form-commande.html")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login",methods=["POST","GET"])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        utilisateur = Authentification(email, password)
        if utilisateur:
            load_user(utilisateur['id'])
            user = User(
                utilisateur['id'],
                utilisateur['id_role'],
                utilisateur['nom'],
                utilisateur['email'],
                utilisateur['nom_roles']
            )
            login_user(user)
            session.permanent = True
            session['connecter'] = True
            session['identifiant'] = int(utilisateur['id'])
            session['role'] = utilisateur['nom_roles']
            session['username'] = utilisateur['nom']
            if session['role'].lower() == 'admin':
               return redirect(url_for("Page_Dashboard"))
            else:
               return redirect(url_for("Page_client"))
        else:
            flash("Email ou mot de passe incorrect, Veuillez réessayer.", "danger")
    return render_template('login.html')
         
@app.route("/login_maquis", methods=["POST", "GET"])
def login_maquis():
    if request.method == 'POST':
        code_maquis = request.form['code_maquis']
        maquis = get_maquis_by_code(code_maquis)
        if maquis:
            session['connecter'] = True
            session['maquis_id'] = maquis['id']
            session['maquis_nom'] = maquis['nom'] 
            session['maquis_code'] = code_maquis
            return redirect(url_for("commission"))
        else:
            flash("Code maquis incorrect, Veuillez réessayer.", "danger")
    return render_template('login_maquis.html')

@app.route("/Client")
def Page_client():
    return render_template("commande.html")

@app.route("/Dashboard",methods=["POST","GET"])

def Page_Dashboard():
    if request.method == "POST":
        status = request.form.get("Traiter") or request.form.get("Livrer")
        id_utilisateur=session['identifiant']
        id_commande = request.form.get("id_commande")
        update_commande(id_commande, status,id_utilisateur)
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
            "lieu":i[11]
            })
            
    return jsonify({
            "succes":True,
            "data":table,
            "count":len(table)
        })
 
@app.route("/Commande")
def commande():
    return render_template("all-commandes.html")

@app.route('/inscriptionPartenaire')
def partenaire():
    return render_template('inscription-partner.html')

@app.route("/api/actionCommande", methods=["POST"])
def api_commandes():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Requête invalide"}), 400

    commune = data.get("delivery_address").lower()
    contact = data.get("contact_phone") or data.get("contactPhone")
    qty = data.get("quantity")
    Numcode = data.get("CodeCommande")
    subtotal = data.get("subtotal")
    total = data.get("total")
    promo = data.get("promo_code") or None
    nom =f"Cli-{random.randint(100, 999)}"
    statut = "Nouvelle_commande"
    prix_unitaire = 5000
    contactMessage = "225" + contact.strip().replace(" ", "")[2:]
    dateMesssage=datetime.now().strftime("%d-%m-%Y %H:%M ")
    
    if promo is None:
        code="Aucun"
        telPatenaire=""
    else:
        code=promo
        data=get_maquis_by_code(code)
        telPatenaire="225" + data["telephone"].strip().replace(" ", "")[2:] 
    
    Message(contactMessage,telPatenaire,dateMesssage,Numcode,total,commune,qty,code)

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
    return render_template("commission.html")
    
    

@app.route("/api/commissions")
def api_commissions():
    maquis_id = session['maquis_code']
    data = read_commission(maquis_id)
    total_commission = 0
    table=[]
    
    for i in data:
        information={
            "id":i[0],
            "produit":i[1],
            "commission":i[2],
            "date":i[3],
            "quantite":i[4]
        }
        total_commission += i[2]
        
        table.append(information) 
    total_commande = len(table)
    total_commission = total_commission
    
    return jsonify({
        "commandes" : table,
        "total_commande": total_commande,
        "total_commission": total_commission
    })

@app.route("/livreur")
def livreur():
    return render_template("livreur-commandes.html")

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

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(port=5000,debug=True)
