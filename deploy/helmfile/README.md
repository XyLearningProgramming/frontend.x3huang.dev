## Deploy with helmfile

### Trivials / One-step Operations

1. For a new db in postgres for goatcounter, create it manually and grant user perms.

```bash
postgres=# CREATE DATABASE goatcounter;
CREATE DATABASE
postgres=# GRANT USAGE ON SCHEMA public TO app;
GRANT
postgres=#  GRANT ALL PRIVILEGES ON DATABASE goatcounter TO app;
GRANT
postgres=#  GRANT ALL PRIVILEGES ON SCHEMA public TO app;
GRANT
postgres=#  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app;
GRANT
postgres=#  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app;
GRANT
postgres=# ALTER ROLE app CREATEDB;
ALTER ROLE
postgres=# ALTER DATABASE goatcounter OWNER TO app;
ALTER DATABASE
```

2. need to manually enable visitor counter in goatcounter dashboard

> Ref: https://github.com/htejera/publii-goatcounter-analytics-plugin?tab=readme-ov-file#visitor-counter

3. need to create local path for storage on destined node

```bash
sudo mkdir -p /var/goatcounter-data
sudo chown -R 1000:1000 /var/goatcounter-data
sudo mkdir -p /var/isso-data
sudo chown -R 1000:1000 /var/isso-data
```


### Helpers

1. Load local image to k3s

```bash
sudo sh -c 'docker save x3huang/frontend.x3huang.dev:local-1 | k3s ctr images import -'
sudo sh -c 'k3s ctr images ls | grep x3huang/frontend.x3huang.dev:local-1'
```

2. Rollback or delete helm release

```bash
$ helm uninstall goatcounter -n frontend
release "goatcounter" uninstalled
$ helm history goatcounter -n frontend
Error: release: not found
```

3. DO NOT create same site using goatcounter twice. I have commented related code block in `deploy/helmfile/goatcounter/templates/deployment.yaml`.
