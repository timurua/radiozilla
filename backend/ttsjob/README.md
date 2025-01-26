# Running
```
export PYTHONPATH="..:.:$PYTHONPATH" && python3 -m main
```

# Building
```
docker compose down
docker compose build
docker compose up
docker compose push
```

# Port Forwarding
```
microk8s kubectl port-forward --address 0.0.0.0 -n minio-operator service/minio 10080:80
```

# Clone fish=speech

```
```

# Installation
```
sudo apt install docker-buildx
```

# Running
```
sudo docker build -t localhost:32000/radiozilla-ttsjob-base:latest .
sudo docker push localhost:32000/radiozilla-ttsjob-base:latest
```


