
## Pre-requisites 

- OpenAI API key (Necessary if you use OpenAI LLM)
- Hugging Face API Key (Necessary if you use Hugging Face LLM)


#### OpenAI API Key

- Create an account with OpenAI if you haven't already.
- Create an API key at https://platform.openai.com/account/api-keys
- Copy the key somewhere safe.

#### Hugging Face API Key

- Create a hugging face account (https://huggingface.co)
- Generate an API key  (https://huggingface.co/settings/tokens)
- Copy the key somewhere safe

It's good to create separate API keys for separate projects/tools. That way if you need to disable a key for a project, you don't have to generate new keys for all your other projects.

## Setting up Mongo

Create an environment variable for `MONGO_ROOT_PASSWORD` and give it a value.

``` Launch-Mongo
cd into langchain-testbench folder
docker-compose up
```

In a separate command prompt window:

``` Create-User
docker exec -it dkrcomp-mongo mongosh -u mongoadmin -p %MONGO_ROOT_PASSWORD%  --authenticationDatabase admin
use admin
db.createUser({user: "testbench", pwd: "testbench", roles: [{ role: "readWrite", db: "testbench" }]})
exit
```


## Generate ssh key for github

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

## Assuming key is placed in default id_rsa for following instructions.
## Change the file references below where necessary, if you change the default.
```

Go to the ssh keys page in github: https://github.com/settings/keys

Click "New SSH Key"

Give the key a title, choose "Authentication Key"

Then paste the content of the file ~/.ssh/id_rsa.pub into the "Key" textbox and click "Add SSH Key"

``` Setup ssh
ssh-keygen -R github.com
ssh -T git@github.com
```

## Create a virtual environment

``` Install-venv
cd into langchain-testbench folder
pip install virtualenv

python -m venv venv

## To activate the environment:
venv\Scripts\activate

## 
pip install -r requirements.txt
cd app
npm install
```

Create a .env file in the langchain-testbench folder with your api keys and root pw.

```.env
MONGO_ROOT_PASSWORD=[mongo root pw]
OPENAI_API_KEY=[your openai API key]
MONGODB_URL=mongodb://testbench:testbench@localhost:27017/testbench
MONGODB_DATABASE=testbench
HUGGINGFACEHUB_API_TOKEN=[your hugging face API key]
```

Create a copy of this .env file and place it in the docker-envs folder and call it server.env. In the docker-envs version,
replace "localhost" with "mongo":
```
MONGODB_URL=mongodb://testbench:testbench@mongo:27017/testbench
```

Create another .env file in the app folder.

```app/.env
VITE_SERVER_URL=http://localhost:4900
```

MONGODB_URL=mongodb://testbench:testbench@mongo:27017/testbench

## Configuring Dockerfile

Edit these environment variables

```
ENV MONGO_INITDB_ROOT_PASSWORD=[Mongo Password]
ENV OPENAI_API_KEY=[Open AI API Key]
ENV HUGGINGFACEHUB_API_TOKEN=[Hugging Face API Key]
```

## Running it

```
cd into langchain-testbench folder
docker-compose build
docker-compose up
```

URL is http://localhost:5173
