
# Kubernetes scripts

## Install

```
microk8s kubectl apply -f persistence-volume.yaml
microk8s kubectl apply -f persistence-volume-claim.yaml
microk8s kubectl apply -f secret.yaml
microk8s kubectl apply -f deployment.yaml
microk8s kubectl apply -f service.yaml
microk8s kubectl apply -f backup-cronjob.yaml
```

## Delete

```
sudo microk8s kubectl delete -f secret.yaml
sudo microk8s kubectl delete -f service.yaml
sudo microk8s kubectl delete -f deployment.yaml
sudo microk8s kubectl delete -f backup-cronjob.yaml
sudo microk8s kubectl delete -f persistence-volume-claim.yaml
sudo microk8s kubectl delete -f persistence-volume.yaml
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

Create DB
```
-- Create the user
CREATE USER db_user WITH PASSWORD 'db_password';

-- Create the database
CREATE DATABASE db;

-- Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE db TO db_user;

-- Connect to the new database
\c db;

ALTER ROLE db_user WITH LOGIN CREATEDB;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO db_user;
GRANT CREATE ON SCHEMA public TO db_user;

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_user;

-- Grant for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO db_user;

-- Creating vector extension
CREATE EXTENSION IF NOT EXISTS vector;
```
Connecting

```
psql -d db -U db_user username
```
Or using a connection string:
```
postgresql://db_user:db_password@localhost:5432/db
```
# Deleting
```
DROP DATABASE db;
-- Revoke schema privileges
REVOKE ALL PRIVILEGES ON SCHEMA public FROM db_user;

-- Revoke default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM db_user;

-- Drop objects owned by the user
DROP OWNED BY db_user;

-- Now drop the user
DROP USER db_user;
```

