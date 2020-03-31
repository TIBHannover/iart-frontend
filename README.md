# Installation

## Required software and tools

- npm
- django
- elasticsearch

## Installation 

```
git clone git@git.tib.eu:iart/web.git
cd web
git submodule init
git submodule update
```

## Import data from ARTigo

Download images 

```
rsync -azv -e 'ssh -A -J springsteinm@exchange.research.tib.eu' springsteinm@devbox3.research.tib.eu:/nfs/data/iart/web/ ./
tar -xf media.tar.gz -C ./
```

Import Database

```
npm install elasticdump --prefix ./    

./node_modules/elasticdump/bin/elasticdump \
  --input=iart_mapping.json \
  --output=http://localhost:9200/iart \
  --type=mapping

./node_modules/elasticdump/bin/elasticdump \
  --input=iart.json \
  --output=http://localhost:9200/iart \
  --type=data

```


## Export

```sh
elasticdump \
  --input=http://production.es.com:9200/iart \
  --output=/tmp/iart_web//my_index_mapping.json \
  --type=mapping
./elasticdump \
  --input=http://production.es.com:9200/iart \
  --output=/tmp/iart_web//my_index.json \
  --type=data
```
