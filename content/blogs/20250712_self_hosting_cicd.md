---

title: 'From Bare-metal to Kubernetes 2: Github Actions as Push-Based CICD Pipelines' 
description: "How I built pipelines that automate build, test, and deployment to k8s cluster via github actions, helm, helmfile, with features like environment and secret management"
headline: '' 
date: '2025-07-12T12:00:00' 
dateUpdated: '2025-07-12T00:00:00'
published: true 
author: 'Xinyu' 
tags: ['self-host', 'k8s', 'vps']
readTime: 10
image:
  src: '/images/20250712_sh2_img0_github.png'
  alt: 'Push-Based GitOps with Github Actions'
---

TL;DR: TODO

::RepoGithub
---
url: https://github.com/XyLearningProgramming/helm.x3huang.dev
description: Charts of site infrastructure, mixing custom and third-party ones.
---
::

::RepoGithub
---
url: https://github.com/XyLearningProgramming/frontend.x3huang.dev
description: Site repo as an example of chart with custom image.
---
::

> not an exact step-by-step tutorial; focus on comparing choices and summarizing my current cicd pipeline instead;

1. for what?

- auto-deploy whenever there's an update from my repo;
- release managed in k8s, records of release, update only components if diff, enable to pull back or cancel without dragging down machine;
- but also with manual approval checkpoint, env. secret management feature;
- small mem footprint, suitable for low budget vps;

2. comparing methods

TODO: add a table here listing pros and cons of each method

topic: push vs pull based
method 1: jenkins / github actions for push; pros: lighter footprint on machines
method 2: FluxCD / ArgoCD; pros: stray state monitor; fewer and simpler setting in repo; ideal for larger projects since their settings can be found and configured together

topic: pipeline push pattern
method 1: via ssh, copy code base or built package, deploy; cons: install helm, helmfile on vps
method 2: via k8s api; cons: exposing port

> note that k8s port expose issue can be solved by 1. only allow connection from my ip, github runners, other agents in k8s cluster (whitelist mechanism); example TODO 2. fail2ban parsing to ban ip frequently trying; 3. reverse proxy, bastion machine, etc.

additional considerations when extra build image step is needed:

   1. what to do with image when deploying
      1. choose a registry, set tag, and download inside node by kubelet; or 2. ssh or other ways to transfer image; 3. use basic image, transfer repo or built ones as zip, and attach volume to the image at place;

   2. what to do when compiling image
      1. two-step build inside docker image? - not a must, opt out for now

::Image
---
src: /images/20250712_sh2_img1.jpg.png
alt: PushBased GitOps (CD Pipeline) for k8s Cluster
size: large
---
::

In the end, I chosed the push-based for my k8s cluster on vps, because it requires no extra setup / container inside the cluster, saves memory;

description of the steps: 1. pull request trigger ci, test, lint, etc. 2. merge to main trigger cd, requires extra manual review by code repo owner, me, leveraging env settings in github; 3. in cd, build image and push to docker registry with ` '{{github.sha}}' ? todo what is it?; 4. in cd, set kube config with access to my k8s server, use helmfile as wrapper to render rollout deployment with features / settings listed below

3. trivial but useful settings in my push-based pipeline now

3.1. env management


::Image
---
src: /images/20250712_sh2_img3.jpg
alt: Environment Management
size: large
---
::


for local dev, test, prod, different env each with a set of vars, need to render config dynamically based on env;

eg. kubectl apply can cover; helm can use multiple values overwritting? add code example; helmfile can apply different set of values by env name;

TODO kubectl, helm examples

helmfile example:
::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/helmfile.yaml.gotmpl#L8
language: yaml
maxHeight: 400
---
::

apply eg. to obtain tls cert, acme server setting should be empty and use local signed for local and / or test, but is set for prod

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/ingress-cert/templates/cluster-issuer.yaml#L9
language: yaml
maxHeight: 400
---
::

3.2. secret management

::Image
---
src: /images/20250712_sh2_img2.jpg
alt: Secret Management
size: large
---
::

3.2.0. secrets are ignored in .gitignore and examples of secret, to illustrate format are un-ignored.

```yaml[.gitignore]
# Secrets files
secrets/*
!secrets/*.example.*
```

3.2.1 secret setup
chose to use github env. secret and set prod ones in it;

3.2.2. secret flow during deployment
cd workflow read secrets via `'{{ xxx }}'`; note the pitfall of using double quotes eg. "" and if doing so, $ will be replaced,

eg.
::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/secrets/mail.example.cf
language: yaml
maxHeight: 200
---
::

secrets are then injected as local files inside repo checked out;
secrets are then **"upserted"** from these files into k8s cluster as secret type config using script leveraging kubectl create -o yaml and kubectl apply; TODO: explain why this works; explain --from-env and --from-file with examples;

eg.
::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/scripts/apply-secrets.sh#L41
language: yaml
maxHeight: 400
---
::

each deployment then use its own ways, to use existing k8s secret in different ns.

where secrets are inside each container?

1. mount as volumeMounts, declare secret path in extraVolumes but chart should support such customization example is 

eg. mail server I mount my rsa private key inside container with designated mountPath
::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/mail/values.yaml.gotmpl#L37
language: yaml
maxHeight: 400
---
::

2. set as env var, if image supports it, need to read doc; eg. my frontend site, use env var to set external postgres to store content instead of using sqlite by default

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/frontend.x3huang.dev/blob/main/deploy/helmfile/chart/templates/deployment.yaml#L46
language: yaml
maxHeight: 400
---
::

3. use helmfile -> helm -> ?? -> ext. over golang template to inject and generate config on the fly

cons: strongly against it only if too hard to comply with third-party charts, or whenever doc. is not clear;
eg. bitname redis, set username and password, doc and comment not clear enough how to attach secrets as file with what format, I gave up; https://github.com/bitnami/charts/blob/main/bitnami/redis/values.yaml#L172 and using kubectl to write config on the fly given secrets

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/db/redis.values.yaml.gotmpl#L24
language: yaml
maxHeight: 400
---
::

but to avoid log secrets inside runner log, I have to leverage github runner's ? mask logic and add mask programmatically over my secrets

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/.github/workflows/cd.yml#L69
language: yaml
maxHeight: 400
---
::

downside: dangerous; also, secrets after sha256 might still be exposed; but sometimes I took the risk for now since I set secrets long and using random generator;


conclusion

TODO ... 
Other topics to come: 1. cert management; 2. mail docker setting, concept intro, common pitfalls; 3. backend model server deploy example via similar pipeline
