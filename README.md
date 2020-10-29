# LibQuality

Short description

## Requirements

- OS Linux (only tested)
- Github (to download the project)
- Docker (v19.03 - tested)/DockerCompose (v1.25 - tested)
- Host must to be Swarm node. If it doesn't, run command bellow:
  
``` bash
docker swarm init
```

- Have **make** package installed. To it, run following command:

``` bash
sudo apt-get update && sudo apt-get install -y make
```

## Commands

To see available commands:

``` bash
make help
```

## Quickstart

### Create deploy.prop file

it is necessary create **deploy.prop** file, **because** the application will get the environment variables from it. To it, run the following command and fill it according to your needs

``` bash
cp deploy.example.prop deploy.prop
```

### Build the project

``` bash
make build
```

### Deploy the application

``` bash
make deploy
```

That's it!

## Addresses

- Swagger: [http://YOUR_IP:3333/apidoc](http://YOUR_IP:3333/apidoc)
- Kibana: [http://YOUR_IP:5601](http://YOUR_IP:5601)

## Issues/Solutions

- I am not able to access dashboard
  - run the command **docker ps**, if you are not seeing ELK stack running, they are stopped. In most cases running the command bellow, solves the problem. After run the command, try to deploy dashboard stack again. ( PS: *You will need to have **sudo** permission*)

``` bash
sudo sysctl -w vm.max_map_count=262144
```
