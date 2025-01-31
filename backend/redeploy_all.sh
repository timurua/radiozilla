#!/bin/bash

microk8s kubectl delete all -l app=scraperjob
microk8s kubectl delete all -l app=summarizerjob
microk8s kubectl delete all -l app=ttsjob
microk8s kubectl delete all -l app=publisherjob

docker compose -f ./docker-compose-scraperjob.yml build --push
docker compose -f ./docker-compose-summarizerjob.yml build --push
docker compose -f ./docker-compose-ttsjob.yml build --push
docker compose -f ./docker-compose-publisherjob.yml build --push

microk8s kubectl create -f=./scraperjob/job.yaml
microk8s kubectl create -f=./summarizerjob/job.yaml
microk8s kubectl create -f=./ttsjob/job.yaml
microk8s kubectl create -f=./publisherjob/job.yaml

microk8s kubectl create -f=./scraperjob/cron_job.yaml
microk8s kubectl create -f=./summarizerjob/cron_job.yaml
microk8s kubectl create -f=./ttsjob/cron_job.yaml
microk8s kubectl create -f=./publisherjob/cron_job.yaml