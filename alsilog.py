
# Alsilog router file.
# uwsgi --socket 127.0.0.1:3031 --wsgi-file alsilog.py --callable app --processes 4 --threads 2 --stats 127.0.0.1:9191


from flask import Flask
from flask import render_template as render

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')