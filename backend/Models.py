from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, id_role, nom, email, nom_roles):
        self.id = id
        self.id_role = id_role
        self.nom = nom
        self.email = email
        self.nom_roles = nom_roles