- docker --version
- docker info
- docker ps

docker run -d -p 8080:80 --name balcao-cafeteria nginx:alpine

docker ps

docker stop balcao-cafeteria

docker rm balcao-cafeteria

docker images

docker build -t cafeteria-iniciante:1.0 .

docker run -d -p 8080:80 --name cafe-rodando cafeteria-iniciante:1.0

docker compose up -d

docker exec -it cafeteria-fila redis-cli

PING

Salvar um dado: SET chave "valor"

Ler um dado: GET chave

Verificar se existe: EXISTS chave

Apagar o pedido: DEL pedido:01

Sair do painel do Redis: Digite exit

docker compose up --build -d

docker compose up -d
