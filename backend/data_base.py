import pymysql

def connexion():
    connexion = pymysql.connect(
        host='mysql-divix.alwaysdata.net',
        user='divix',
        password='Biometricifsm@2025',
        database='divix_bonpoulet'
    )
    return connexion