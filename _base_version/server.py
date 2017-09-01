# Neouronaming
# by en.arb.digital
# Torch & LSTM

from websocket_server import WebsocketServer
from json import dumps, load
from subprocess import check_output
import shelve
import multiprocessing

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import re
 
d = shelve.open('storage')

WSPORT = 9001

wsServer = WebsocketServer(WSPORT)

if not d.has_key('total'):
# 283250
	d['total'] = 0;

def get_cats ():
	with open('categories.json') as cats_file:
		cats = load(cats_file)
	return cats

def get_names (cat):
	result = check_output(['th', '/home/neuronaming/torch/torch-rnn/sample.lua', '-checkpoint', '/home/neuronaming/torch/torch-rnn/cv/'+cat+'/checkpoint.t7', '-length', '400', '-gpu', '-1'])
	res = [v for v in result.splitlines() if len(v.strip())][1:11]
	d['total'] = d['total'] + len(res)
	return res

def check_cat (cat):
	cats = get_cats()
	c = [c for c in cats if c['value'] == cat]
	return c

def new_client(client, server):
	server.send_message(client, dumps({'total': d['total'], 'cats': get_cats()}))

def client_left(client, server):
	return None

def message_received(client, server, message):
    if check_cat(message):
	#message = '';
	res = get_names(message)
	server.send_message_to_all(dumps({'total': d['total']}))
	server.send_message(client, dumps({'names': res}))

def start_ws ():
	wsServer.set_fn_new_client(new_client)
	wsServer.set_fn_client_left(client_left)
	wsServer.set_fn_message_received(message_received)
	wsServer.run_forever()
	

class HTTPRequestHandler(BaseHTTPRequestHandler):
  def do_GET(self):
    if None != re.search('/api/v1/getnames/*', self.path):
      cat = self.path.split('/')[-1]
      if check_cat(cat):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
	res = get_names(cat)
	wsServer.send_message_to_all(dumps({'total': d['total']}))
        self.wfile.write(dumps(res))
      else:
        self.send_response(400, 'Bad Request: category does not exist')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
    else:
      self.send_response(403)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
    return
 
#if __name__=='__main__':
#  parser = argparse.ArgumentParser(description='HTTP Server')
#  parser.add_argument('port', type=int, help='Listening port for HTTP Server')
#  parser.add_argument('ip', help='HTTP Server IP')
#  args = parser.parse_args()

HTTP_IP = '127.0.0.1'
HTTP_PORT = 8080
 
def start_http():
	try:
		server = HTTPServer(("", HTTP_PORT), HTTPRequestHandler)
		print 'HTTP Server started...........'
		server.serve_forever()
	except KeyboardInterrupt:
	        print "^C received, shutting down server"
        	server.socket.close()

#start_http()

w = multiprocessing.Process(target=start_ws, args=())
w.start()
h = multiprocessing.Process(target=start_http, args=())
h.start()
