
Trivials:

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
