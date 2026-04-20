import pymysql
import os
from dotenv import load_dotenv
load_dotenv()

def connexion():
    connexion = pymysql.connect(
        host=os.getenv("HOST"),
        user=os.getenv("USER"),
        password=os.getenv("DB_PWD"),
        database=os.getenv("DB")
    )
    return connexion

