from pyapi import create_app
from flask import Flask

app: Flask = create_app()

if __name__ == '__main__':
    app.run(debug=True)