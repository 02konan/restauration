from flask import Flask, render_template, request, jsonify, redirect, url_for,session,flash
from flask_cors import CORS
from functools import wraps
from backend.creat_data import create_commande,update_commande
from backend.read_data import liste_commandes,read_commission,get_maquis_code
# from backend.Auth import Authentification
import random
app = Flask(__name__)
app_key="Biometricifsm@2025divix_bonpouletmysql-divix.alwaysdata.netdivix"




@app.route("/")
def home():
    return render_template("form-commande.html")

# CORS(app)
# def init_session():
#     if 'connecter' not in session:
#         session['connecter'] = False

# @app.before_request
# def before_request():
#     init_session()

# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if 'connecter' not in session or not session['connecter']:
#             return redirect(url_for('login'))
#         return f(*args, **kwargs)
#     return decorated_function

# def role_required(role):
#     def decorator(f):
#         from functools import wraps
#         @wraps(f) 
#         def decorated_function(*args, **kwargs):
#             if 'role' not in session or session['role'].lower() != role.lower():
#                 flash("Accès refusé : vous n'avez pas les droits nécessaires.", "danger")
#                 return redirect(url_for('index'))
#             return f(*args, **kwargs)
#         return decorated_function
#     return decorator


# @app.route("/login")
# def login():
#     if request.method == 'POST':
#         email = request.form['email']
#         password = request.form['password']

#         utilisateur = Authentification(email, password)
#         if utilisateur:
#             session.clear()
#             session.permanent = True
#             session['connecter'] = True
#             session['username'] = email
           

#             if utilisateur['nom_roles'].lower() == 'superadmin':
#                 return redirect(url_for('index'))
#             elif utilisateur['nom_roles'].lower() == 'admin':
#                 return redirect(url_for('index'))
#             else: 
#                 return redirect(url_for('index'))
#         else:
#             flash("Identifiants incorrects. Veuillez réessayer.", "danger")
#     return render_template('login.html')

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

    commune = data.get("delivery_address")
    contact = data.get("contact_phone") or data.get("contactPhone")
    qty = data.get("quantity")
    Numcode = data.get("CodeCommande")
    subtotal = data.get("subtotal")
    total = data.get("total")
    promo = data.get("promo_code") or None
    nom =f"Cli-{random.randint(100, 999)}"  # Générer un nom de client basé sur les derniers chiffres du code de commande
    statut = "Nouvelle_commande"
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
    commissions = read_commission(maquis_id= 77)
    unique_commands = len(set(c['id_commande'] for c in commissions))
    total_com = sum(c['commission'] for c in commissions)
    data =read_commission()
    commissions = []
    for row in data:
         commissions.append({
                'id_commande': row[0],  # Nouveau champ
                'nom_produit': row[1],  # Était row[0] avant
                'commission': row[2],   # Était row[1]
                'date_commande': row[3], # Était row[2]
                'quantite': row[4]      # Était row[3]
            })
        
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
