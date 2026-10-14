"""
Sets bcrypt hashes for the demo teachers (password: demo123).
Run once after importing schema_mysql.sql.

  pip install pymysql bcrypt
  set DATABASE_URL=mysql://user:pass@host:port/dbname      (Windows CMD)
  $env:DATABASE_URL="mysql://user:pass@host:port/dbname"   (PowerShell)
  python set_demo_passwords.py
"""
import os
import ssl
from urllib.parse import urlparse, unquote

import bcrypt
import pymysql

url = urlparse(os.environ["DATABASE_URL"])
con = pymysql.connect(
    host=url.hostname,
    port=url.port or 3306,
    user=unquote(url.username),
    password=unquote(url.password),
    database=url.path.lstrip("/"),
    ssl=ssl.create_default_context(),  # cloud hosts require SSL; remove this line for a local MySQL
)

hashed = bcrypt.hashpw(b"demo123", bcrypt.gensalt(12)).decode()
with con.cursor() as cur:
    cur.execute("UPDATE teachers SET password_hash=%s", (hashed,))
    print(f"Updated {cur.rowcount} teachers")
con.commit()

with con.cursor() as cur:
    cur.execute("SELECT email, password_hash FROM teachers WHERE email='ananya.sen@college.edu'")
    email, h = cur.fetchone()
    print("Login check:", "OK" if bcrypt.checkpw(b"demo123", h.encode()) else "FAILED")
con.close()
