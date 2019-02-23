Table of Contents
=================

  * [About](#about)
  * [Installation](#installation)
    - [Python, virtualenv and rnn](#python-virtualenv-and-rnn)
    - [Torch, luarocks](#torch-luarocks)  
      - [Testing](#testing)   
    - [Nginx and server](#nginx-and-server)
  * [Custom model](#custom-model)
  * [License](#license)

# About
ML powered business names generator with web server and UI. Proof of concept. Industry classification is based on UK ["Standard industrial classification of economic activities (SIC)"](https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic).

Based on Torch LSTM implementation: [torch-rnn](https://github.com/jcjohnson/torch-rnn) by Justin Johnson.

Pre-trained model checkpoints included as separate download (See [here](#testing)).

# Installation

Debian / Ubuntu (14.04/16.04). CPU-only.

> Keep in mind, that initial version was create in 2015, so there could be outdates dependencies and such. Please contribute to update the code.

### Python, virtualenv and rnn

Install `sudo` and `git` if it's not on the system yet:
```
apt-get install sudo
sudo apt-get install git-core
```

Also `nano` can be a good starter choice for a file editor (used in this guide): `sudo apt-get install nano`

---

```
git clone https://github.com/vladzima/neuronaming-dev
cd neuronaming-dev
```
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
cd torch-rnn
```

Open `nano ~/.bashrc` and add:
```
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/devel/python
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python
source ~/.local/bin/virtualenvwrapper.sh
```
Relogin and create virtual env:
```
su - neuronaming
mkvirtualenv -p python2 neuronaming
```
Install deps:
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

#### Testing

Copy and extract pre-trained model checkpoints directory:
```
cd ~/torch-rnn
wget https://storage.googleapis.com/nnnet_storage/cv.cpgz
gzip -cd cv.cpgz | cpio -idmv
```

Now test:
```
workon neuronaming
th /home/neuronaming/torch-rnn/sample.lua -checkpoint /home/neuronaming/cv/C/checkpoint.t7 -length 400 -gpu -1
```

### Nginx and server

Login as your root user and install `nginx`:
```
sudo apt-get update
sudo apt-get install nginx
```

Install `virtualenv` и `virtualenvwrapper` again, as Flask likes Python3:
```
sudo apt-get install python3-pip
pip3 install virtualenv virtualenvwrapper
su - neuronaming
```
Open `nano ~/.bashrc` and add:
```
export WORKON_HOME=$HOME/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
```
```
su - neuronaming
mkvirtualenv env-name
pip3 install uwsgi flask
```

If ufw firewall is on: `ufw allow 5000`

Create socket:
```
mkfifo /home/neuronaming/site/server.sock
```

Create autostart script:

###### For Ubuntu 14.04
```
touch /etc/init/server.conf
nano /etc/init/server.conf
```

Copy in `server.conf`:
```
description "uWSGI instance to serve neuronaming project"
start on runlevel [2345]
stop on runlevel [!2345]

# Place actual nginx uid instead of 2345; lookup: "top b|less"

setuid www-data
setgid neuronaming
env PATH=/home/neuronaming/.virtualenvs/neuronaming/bin
chdir /home/neuronaming/site
exec uwsgi --ini server.ini
```

###### For Ubuntu 16.04
```
touch /etc/systemd/system/server.service
nano /etc/systemd/system/server.service
```
Copy in `server.service`:
```
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
```
Start `wsgi`:
###### For Ubuntu 14.04
```
sudo start server
```
###### For Ubuntu 16.04
```
sudo systemctl start server
sudo systemctl enable server
```

Open nginx conf: `nano /etc/nginx/sites-available/default` and copy:
```
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
    root /home/neuronaming/site/static;
    index index.html;
    server_name DOMAIN;
    location / {
            try_files $uri $uri/ =404;
    }
    location /api01 {
        include uwsgi_params;
        uwsgi_pass unix:/home/neuronaming/site/server.sock;
    }
}

# Insert actual domain in place of DOMAIN
```

Restart nginx:
###### For Ubuntu 14.04
```
sudo service nginx restart
```
###### For Ubuntu 16.04
```
sudo systemctl restart nginx
```

If ufw firewall is active:
```
ufw delete allow 5000
ufw allow 'Nginx Full'
```
Please check that the resulting project structure is relevant:
```
.
├── torch-rnn
│   └── cv
│       └── ...
└── site
    ├── static
    ├── server.ini
    ├── server.py
    ├── storage.dat
    └── wsgi.py
```
# Custom model

To train your own model and use in to generate new text, please consult with the original torch-rnn manual: https://github.com/jcjohnson/torch-rnn#usage.

# License

MIT License

Copyright (c) 2015 Neuronaming

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
