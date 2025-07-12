---

title: 'From Bare-metal to Kubernetes: Intro to My "Over-Engineered" Blog Site' 
description: "How I ditched my WordPress setup and went down the rabbit hole of hosting my site with k3s on VPS machines. It's been a ride."
headline: 'Why I Rebuilt My Entire Site on a K3s System' 
date: '2025-07-02T12:00:00' 
dateUpdated: '2025-07-08T00:00:00'
published: true 
author: 'Xinyu' 
tags: ['self-host', 'k8s', 'vps']
readTime: 12
image:
  src: '/images/20250712_sh2_img0_github.png'
  alt: 'Push-Based GitOps with Github Actions'
---

**TL;DR:** My site is now on k3s. It's fast, it has controls over failures, and I can sleep at night. The whole setup is code, which you can see in my repo, and there's a pretty diagram at the end if you want to see its structure.

::RepoGithub
---
url: https://github.com/XyLearningProgramming/helm.x3huang.dev
description: The Helm charts that hold my digital kingdom together.
---
::

> So, this is the story of how I decided to host my personal site, [x3huang.dev](https://x3huang.dev), on a Kubernetes cluster, and a glimpse of its status quo. This isn't really a tutorial with copy-paste commands—my repo already shows the "what." This is the "why." It's about trading a familiar, easy-to-start system for something with an almost infinite amount of potential.

-----

### The Day the Server Died and Got Abandoned

My journey, like many, began with WordPress on a classic LNMP stack. It was great. For a while. I followed a guide, typed some commands, and I had a pretty good-looking website. Easy peasy.

::Image
---
src: /images/20250702_sh_img2.jpg
alt: LNMP structure of my previous site
size: large
---
::

The cracks started to show pretty quickly, though. The site would just... get *slow*. Sometimes from a bit of traffic, sometimes just because I dared to edit a post. Then came the attacks. Nothing major, but enough to swamp the server. Trying to SSH into a machine that's gasping for air while under load is an exercise in futility. The whole stack was a "house of cards".

Maintaining the site was not easy too. I was locked into the WordPress ecosystem. If there wasn't a plugin for what I needed, I was out of luck. And trying to make it talk to any of my other, non-PHP projects? Let's just say my PHP skills are not something I like to talk about at parties.

I knew I needed a change. I wanted a stack that was mine, from top to bottom. I wanted something that wouldn't fall over if one little part failed. I wanted infrastructure I could define in a file, so I could burn it all down and bring it back to life with a single command. I needed something that could handle the quiet days (like, less than one request per second) but not melt during a sudden spike from Hacker News or real hackers. And most of all, I wanted to *see* what was happening: the observability.

-----

### Picking the Tools for the Job 🛠️

So, what's with a couple of cheap VPS machines to do? My toolkit was limited: small affordable virtual servers, each with a couple of cores and a measly gig or two of RAM, plus whatever I could get from cloud providers.

Why not just use a managed Kubernetes service from a big cloud provider? Two words: surprise bills. I love the tech, but I'm not a fan of pay-as-you-go plans with no spending cap. This is a personal project I plan to run for years, so a predictable, low cost was key.

Okay, so why not something simpler, like Docker Compose or just plain old `systemd` services? I thought about it. But that felt like kicking the can down the road. I'd still be missing real orchestration, automatic healing, and the powerful networking that I was looking for.

| Approach                   | 👍 Pros                                                                                                                                            | 👎 Cons                                                                                            |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| **Bare-metal (`systemd`)** | Low overhead and simple to start. You have total control over everything.                                                                         | Difficult to reproduce or scale. Every server is in an ephemeral state.                           |
| **Docker + Compose**       | Awesome for defining and running multi-container apps on a *single* machine. The `yaml` files are easy to understand.                             | Falls apart across multiple servers. It's not a true orchestrator; no auto-healing or clustering. |
| **Docker Swarm**           | Surprisingly easy to set up a multi-node cluster. It's built right into Docker and is much simpler than K8s.                                      | Smaller ecosystem. Less powerful networking, permissions, and storage options.                    |
| **K3s**                    | All the power of Kubernetes (scaling, self-healing, vast ecosystem) in a lightweight package. No image build function. No docker daemon overhead. | Steep learning curve. Sledgehammer to crack a nut for simple apps.                                |

In the end, I chose the trinity **k3s**, **helm**, and **helmfile**.

1. **K3s** is a lightweight Kubernetes distro that strips out all the non-essentials and packs everything into one small binary. It’s perfect for nodes under limited resources. Pop open the hood after an install. Besides k8s components and cmd-line tools as built-ins (eg. apiserver, controller-manager, scheduler), which we can somewhat take for granted as a distro, k3s has already handy these add-ons:

```bash
> ls /var/lib/rancher/k3s/server/manifests
ccm.yaml      coredns.yaml    local-storage.yaml    traefik.yaml
metrics-server  rolebindings.yaml
```

2. **Helm** is the package manager for Kubernetes. It means I don't have to write giant YAML files for common software like databases or monitoring tools. I can just grab a battle-tested "chart" from the community and deploy it.

3. **Helmfile** is the glue that holds it all together. It lets me declare my *entire* stack of Helm charts in one file, template out values, and deploy everything in one command `helmfile apply -e prod`. It's Infrastructure as Code, but for Helm.

> One little tweak I made: K3s comes with Traefik built-in, which is cool, but I needed to do some serious customization. To keep things clean, I just... deleted the default `traefik.yaml` manifest. Then I rolled my own Traefik deployment using its official Helm chart, giving me total control.

-----

### The New Kingdom: A Tour of the Architecture

So, after all that, what did I end up with? A glorious, slightly over-engineered, cloud-native infrastructure, but highly scalable and customizable.

::Image
---
src: /images/20250702_sh_img3.jpg
alt: Site architecture as k8s cluster
size: large
---
::

Let's take a quick tour:

Every request to my main domain starts with **Cloudflare**, which handles my DNS and acts as a bouncer, providing free CDN and DDoS protection. Can't beat the free tier.

From there, traffic hits my cluster's front door: **Traefik**. It's the API gateway that inspects all incoming requests and intelligently routes them to the right place by rules such as HostSNI matching, like a very efficient concierge.

**Cert-manager**, which automatically fetches and renews free certificates from Let's Encrypt as requested. No more calendar reminders or cron to renew certs!

Inside the cluster, everything lives in its own little yard. My blog, custom backend apps, a PostgreSQL database, a Redis cache—they are all containerized applications. The best part is that Kubernetes wraps them in a layer of magic that provides automatic healing. If my blog container has a meltdown or a pending update, `kubelet` (the node agent) just shoots it and gets a new one. It's beautifully ruthless.

For observability, I've got **Prometheus** scraping metrics from everything that declares a `ServiceMonitor` and **Promtail** collecting every log line.

Then I ship all these data off to **Grafana Cloud's** free tier, which gives me these dashboards in Grafana without hosting it inside the cluster. This is where I can see everything that's happening across my entire system. 🚀

::Image
---
src: /images/20250702_sh_img4_metrics.png
alt: Screenshot of dashboard based on kubelet metrics
size: large
---
::

::Image
---
src: /images/20250702_sh_img5_logs.png
alt: Screenshot of logs collected
size: large
---
::

This whole setup is a long way from WordPress. But now I have real network isolation with namespaces, so my weird experimental app can't mess with my main site. I have a secure, centralized way to handle secrets. And deployments? I just push a change to my Git repo, and the cluster updates itself.

-----

### So, What's Next?

If you've read this far, you're probably my kind of person. This is just the first part of the story. Here is what's about to come next under the same theme:

  - The CI/CD pipeline that makes my deployments so smooth.
  - My solution for managing secrets in Git without, you know, leaking them all over the internet.
  - The nitty-gritty details of getting TLS certificates working everywhere with `cert-manager` and replicators.

Stay tuned!
