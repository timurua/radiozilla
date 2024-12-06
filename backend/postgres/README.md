
Kubernetes scripts

```
sudo microk8s kubectl apply -f persistence-volume.yaml
sudo microk8s kubectl apply -f persistence-volume-claim.yaml
sudo microk8s kubectl apply -f secret.yaml
sudo microk8s kubectl apply -f deployment.yaml
sudo microk8s kubectl apply -f service.yaml
sudo microk8s kubectl apply -f backup-cronjob.yaml
```

Kubernetes dashboard
```
# create dashboard
sudo microk8s enable dashboard

# token
sudo microk8s kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443

# dashboad
sudo microk8s kubectl describe secret -n kube-system microk8s-dashboard-token
```

Connecting to Postgres
```
# password postgrespassword

psql -h localhost -p 30432 -U postgres -W
```

