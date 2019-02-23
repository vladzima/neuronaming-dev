# Installation

Debian / Ubuntu (14.04/16.04).

### Python, virtualenv and rnn

Install `sudo` and `git` if it's not on the system yet: `apt-get install sudo && sudo apt-get install git-core`

Also `nano` can be a good simple choice for a file editor: `sudo apt-get install nano`

---

```
sudo apt-get -y install python2.7-dev
sudo apt-get install libhdf5-dev
```
Debian: `apt-get install python-h5py`

Add user `neuronaming` and include in sudoers:
```
adduser neuronaming
usermod -aG sudo neuronaming
```

Login as new user:
```
su - neuronaming
cd ~
git clone https://github.com/jcjohnson/torch-rnn
cd torch-rnn
```

Add to new users `.bashrc`:
```
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/devel/python
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python
source ~/.local/bin/virtualenvwrapper.sh
```
Relogin:
```
su - neuronaming
```
```
mkvirtualenv -p python2 neuronaming
```

```
cd ~/torch-rnn
pip install -r requirements.txt
```
In case `h5py` installation fails, open `requirements.txt` and remove version number: `h5py==2.5.0 > h5py`

### Torch, luarocks

(Manual: http://torch.ch/docs/getting-started.html)

```
git clone https://github.com/torch/distro.git ~/torch
cd ~/torch; bash install-deps;

# Takes forever!
```
```
TORCH_LUA_VERSION=LUA53  ./install.sh

# Answer yes about .bashrc
```
```
su - neuronaming
luarocks install torch
luarocks install nn
luarocks install optim
luarocks install lua-cjson 2.1.0

# Takes time!
```

**Attention!** You always need to initiate `th` from the same directory where `torch-rnn/LanguageModel.lua` is.

### Test

Copy and extract pretrained model checkpoints directory:
```
cd ~/torch-rnn/cv
wget 
gzip -cd cv_server.cpgz | cpio -idmv
```

//перелогиниваемся

//тестируем
$ workon neuronaming
#$ th /home/neuronaming/torch-rnn/sample.lua -checkpoint /home/neuronaming/cv/C/checkpoint.t7 -length 400 -gpu -1
$ th sample.lua -checkpoint cv/C/checkpoint.t7 -length 400 -gpu -1

4) замечание
//и еще, желательно, чтобы пути к файлам, с которыми работает th, из server.py, были бы абсолютными


деплой на nginx

1) логинимся под root и ставим nginx
# apt-get update
# apt-get install nginx

2) снова ставим virtualenv и virtualenvwrapper, т.к. flask любит python3, а не python2
# apt-get install python3-pip
# pip3 install virtualenv virtualenvwrapper

//в ~/.bashrc нужного пользователя (neuronaming) дописываем
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/site
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
source /usr/local/bin/virtualenvwrapper.sh
//и перелогиниваемся под юзером

$ mkvirtualenv env-name
[ вариант с выбором версии python: "mkvirtualenv --python=python3 env-name", но по-умолчанию ставится версия 3]

//при этом автоматически идет вход в виртуалку; если этого не произошло - делаем:
$ workon env-name
//далее - все под виртуальной средой

3) ставим flask и uwsgi
$ pip3 install uwsgi flask

4) делаем тестовое приложение на flask
$ touch ~/site/server.py

//копируем туда вот это:

from flask import Flask
application = Flask(__name__)
@application.route("/")
def hello():
return "<h1'>Test Flask app is worked!</h1>"
if __name__ == "__main__":
application.run(host='0.0.0.0')

5) проверяем его работоспособность
$ python server.py

//для ubuntu 16.04 - если настроен файрволл ufw - то:
# ufw allow 5000

//и в браузере открываем приложение по IP или по домену с портом :5000

6) делаем точку входа для wsgi (файл wsgi.py)
$ touch ~/site/wsgi.py

//копируем туда вот это:

from myproject import application
if __name__ == "__main__":
application.run()

7) тестируем работу сервера uwsgi (опять в браузере, но порт :8000)
$ uwsgi --socket 0.0.0.0:8000 --protocol=http -w wsgi

8) создаем socket-файл
$ mkfifo /home/neuronaming/site/server.sock

9) делаем ini-конфиг для wsgi
$ touch ~/site/server.ini

//копируем туда вот это:

[uwsgi]
module = wsgi
master = true
processes = 5
socket = /home/neuronaming/site/server.sock
chmod-socket = 660
vacuum = true
die-on-term = true

10) создаем скрипт автостарта
а) для ubuntu 14.04

# touch /etc/init/server.conf

//копируем туда вот это:

description "uWSGI instance to serve neuronaming project"
start on runlevel [2345]
stop on runlevel [!2345]
#тут - тот uid, под которым стартует nginx; посмотреть его можно через "top b|less"
setuid www-data
#группу оставляем ту же, что у нашего основного юзера
setgid neuronaming
#путь к виртуалке
env PATH=/home/neuronaming/.virtualenvs/neuronaming/bin
#домашний каталог проекта
chdir /home/neuronaming/site
exec uwsgi --ini myproject.ini

б) для ubuntu 16.04

# touch /etc/systemd/system/myproject.service

//копируем туда вот это:

[Unit]
Description=uWSGI instance to serve neuronaming project
After=network.target
[Service]
User=www-data
Group=neuronaming
WorkingDirectory=/home/neuronaming/site
Environment="PATH=/home/neuronaming/.virtualenvs/neuronaming/bin"
ExecStart=/home/neuronaming/.virtualenvs/neuronaming/bin/uwsgi --ini server.ini
[Install]
WantedBy=multi-user.target

11) стартуем wsgi
а) для ubuntu 14.04
# start server

б) для ubuntu 16.04
# systemctl start server
# systemctl enable server

11) если домен и проект на vds - один, то нижеследущее вписываем в /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
    root /home/neuronaming/site/static;
    index index.html;
    server_name neuronaming.net;
    location / {
            try_files $uri $uri/ =404;
    }
    location /api01 {
        include uwsgi_params;
        uwsgi_pass unix:/home/neuronaming/site/server.sock;
    }
}

12) рестартуем nginx
а) для ubuntu 14.04
# service nginx restart

б) для ubuntu 16.04
# systemctl restart nginx

//если настроен файрволл ufw - то:
# ufw delete allow 5000
# ufw allow 'Nginx Full'
