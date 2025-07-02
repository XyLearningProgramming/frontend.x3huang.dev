---
title: 'Self'
description: "TOC"
headline: 'Typesetting and Layout'
date: '2025-07-02T12:00:00'
dateUpdated: ''
published: true
author: 'Xinyu'
tags: ['self-host', 'k8s']
readTime: 10
---

This post aims at describing the deployment of my site [x3huang.dev](x3huang.dev) on a Kubernetes cluster via k3s distro. and helmfile.

It is not a tutorial including every command or components I added, because my repo [helm.x3huang.dev](https://github.com/XyLearningProgramming/helm.x3huang.dev) is self-declarative. But rather a description of the concept, and how versitile it can be, how much potential it has.

Rationale:

What I want and why bash commands, service+systemctl, docker won't satisfy my needs.

- declarative infrastructure, easy to reproduce, record every change
- management of servie life-cycle and liveness probe
- isolated network and reverse proxy
- horizontal scale, chaining multiple machines
- large eco-system
- observalability

Stack choice

Background: limited resource, features (eg. mail server) easy to be as add-on

1. k3s
2. helm charts for each module
3. helmfile + github workflow
  

`k3s` comes with more than k8s components and cmd-line tools as built-ins (eg. apiserver, controller-manager, scheduler). It also is a "battery included" bundle with add-on components. If we check is manifests after installation, we can find these have been added-on by default. 

```
> ls /var/lib/rancher/k3s/server/manifests
ccm.yaml      local-storage.yaml  rolebindings.yaml  traefik.yaml
coredns.yaml  metrics-server      runtimes.yaml
```

However, since I need to customize traefik a lot and I'm trying my best not to make changes diverging from the chart repo, I deleted this `traefik.yaml` manifest and pulled up another one with specified values.

Features:
[archetecture_image goes here]()

