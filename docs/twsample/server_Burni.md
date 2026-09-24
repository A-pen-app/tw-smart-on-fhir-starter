> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## Burni FHIR

#### Server 架設

1. 準備一台Linux環境的電腦(或虛擬機)

1-1. 準備一台Linux環境的電腦(或虛擬機)，並且進入Linux環境中。

2. 安裝Burni FHIR Server

2-1. 安裝docker。

```
sudo snap install docker
```

2-2. 下載Burni on FHIR專案。 (若無法下載專案可點選下載2024/1/30前的版本)

```
git clone https://github.com/Chinlinlee/Burni.git
```

2-3. 進入 Burni 資料夾並安裝 npm 套件。。

```
cd Burni
npm install
```

2-4. 設定環境變數。

```
cp .env.template .env
```

```
MONGODB_NAME="admin"
MONGODB_HOSTS=["fhir-burni-mongodb"]
MONGODB_PORTS=[27017]
MONGODB_USER="root"
MONGODB_PASSWORD="root"
MONGODB_IS_SHARDING_MODE=false
MONGODB_AUTH_DB=admin

SERVER_PORT=8080
SERVER_SESSION_SECRET_KEY="secretKey"

FHIRSERVER_HOST="localhost"
FHIRSERVER_PORT=8080
FHIRSERVER_APIPATH="fhir"

ENABLE_CHECK_ALL_RESOURCE_ID=false
ENABLE_CHECK_REFERENCE=false

ENABLE_CSHARP_VALIDATOR=false
VALIDATION_FILES_ROOT_PATH="/validationResources"
VALIDATION_API_URL="http://burni-fhir-validator-api:7414"
```

2-5. 產生所有 FHIR Resource 的設定檔。

```
cp config/config.template.js config/config.js
node config/generate-config-allResources.js
npm run build
```

2-6. 建立 Plug-in 的設定檔。

```
cp plugins/config.template.js plugins/config.js
```

2-7. 建立 Dockerfile。

```
FROM keymetrics/pm2:16-slim

# Install JDK
RUN apt update && apt install openjdk-11-jdk-headless make g++ python3 netcat curl iputils-ping -y

WORKDIR /
RUN mkdir -p /nodejs/fhir-burni/
RUN chown -R node:node /nodejs
WORKDIR /nodejs/fhir-burni/
# Bundle APP files
COPY --chown=node:node package*.json /nodejs/fhir-burni/
COPY --chown=node:node . /nodejs/fhir-burni/

# Install app dependencies
ENV NPM_CONFIG_docLOGLEVEL warn
ENV NODE_ENV production
RUN npm ci --omit=dev

# Show current folder structure in logs
#RUN ls -al -R
USER node
CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--node-args=\"--max-old-space-size=4096\""]
```

2-8. 建立 docker-compose.yml。

```
version: '3.4'

services:
  fhir-burni-mongodb:
    image: mongo:4.2
    container_name : fhir-burni-mongodb
    restart: always
    ports:
      - 27017:27017
    volumes:
      - ./mongodb/db:/data/db
    environment:
      # provide your credentials here
      - MONGO_INITDB_DATABASE=admin
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=root
      - MONGO_PORT=27017

  fhir-burni:
    build: ./
    container_name: fhir-burni
    command: >
      /bin/sh -c '
      while ! nc -z fhir-burni-mongodb 27017;
      do
        echo "waiting for database ...";
        sleep 3;
      done;
      echo "db is ready!";
      pm2-runtime start ecosystem.config.js;
      '
    volumes :
      - ./:/nodejs/fhir-burni
      - /nodejs/fhir-burni/node_modules
    ports:
      - 8080:8080
    depends_on:
      - fhir-burni-mongodb
    tty : true
    restart: on-failure:3
    stdin_open : true
```

2-9. 啟動 Docker Compose 專案。

```
docker compose up -d --build
```

示範網址

https://Burni.standard-interoperability-lab.com

本網站架設FHIR Server部分資訊來自各個FHIR Server建立的github資源，包含：

HAPI FHIR
、

Smart on FHIR
、

LinuxForHealth FHIR Server
、

Burni FHIR Server

本網站已根據 Apache 2.0 License取得授權

© 
Apache License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

