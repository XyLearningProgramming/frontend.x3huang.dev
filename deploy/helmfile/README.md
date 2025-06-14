## Deploy with helmfile

### Comments

1. Load local image to k3s

```bash
sudo sh -c 'docker save x3huang/frontend.x3huang.dev:local-1 | k3s ctr images import -'
sudo sh -c 'k3s ctr images ls | grep x3huang/frontend.x3huang.dev:local-1'
```