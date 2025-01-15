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

# Running
```
sudo docker build -t timurua/radiozilla-tts-job:latest -f ttsjob/Dockerfile .

