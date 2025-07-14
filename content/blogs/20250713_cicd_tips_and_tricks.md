---
title: 'From Bare-metal to Kubernetes 3: CI/CD Tips for Managing Configs and Secrets' 
description: "A deep dive into practical techniques for managing environments and secrets in a push-based CI/CD pipeline with Helmfile and GitHub Actions."
headline: '' 
date: '2025-07-13T12:00:00' 
dateUpdated: '2025-07-13T00:00:00'
published: true 
author: 'Xinyu' 
tags: ['self-host', 'k8s', 'vps', 'ci-cd', 'github-actions', 'helm']
readTime: 8
image:
  src: '/images/20250712_sh2_img0_github.png'
  alt: 'Push-Based GitOps with Github Actions'
---

**TL;DR:** I use `helm` and `helmfile`'s environment feature to manage different configurations (dev, prod) cleanly. For secrets, I inject them from GitHub Actions into Kubernetes using a custom script that generates and applies `Secret` manifests on the fly. This keeps credentials out of my Git repo and makes my deployments flexible.

> Following up on my CI/CD pipeline architecture, this article explores the practical details that make it tick: environment and secret management.

### 1. Taming Environments with Helmfile

One of the biggest challenges in any project is managing configurations for different environments like development, testing, and production. Hardcoding values is a non-starter, and juggling multiple `kubectl` commands is error-prone.

While Helm's `--values` flag works, **Helmfile** provides a much cleaner, built-in solution. It allows you to define "environments" and associate specific values files with each one. This means you can deploy to any environment with a simple, consistent command: `helmfile -e <env_name> apply`. The variables associated with the env applied will **merge with** default values so that I can just cite them or check their existance.

::Image
---
src: /images/20250712_sh2_img3.jpg
alt: Environment Management
size: large
---
::

Here’s how I define my environments in `helmfile.yaml.gotmpl`. The `prod` environment gets its own `prod.yaml.gotmpl` values file, while all other environments (like local development) use the `default.yaml.gotmpl`.

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/helmfile.yaml.gotmpl#L8
language: yaml
maxHeight: 400
---
::

This is incredibly powerful. For example, I can define a production ACME issuer for `cert-manager` in my `prod` values file, while the default file uses a self-signed issuer for local testing. **Notice** that I defined an `Environment` variable inside values associated with each environment. There is no magic here.

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/ingress-cert/templates/cluster-issuer.yaml#L9
language: yaml
maxHeight: 400
---
::

### 2. Secure Workflow for Secrets

Handling secrets—API keys, passwords, certificates—is the most critical part of any CI/CD pipeline. My approach ensures secrets are never stored in Git but are securely injected into the cluster when needed.

::Image
---
src: /images/20250712_sh2_img2.jpg
alt: Secret Management
size: large
---
::

First, the `.gitignore` file is set up to explicitly ignore secret files, while allowing non-sensitive example files for documentation.

```yaml[.gitignore]
# Secrets files
secrets/*
!secrets/*.example.*
```

The secret workflow then has four main steps:

1.  **Store:** All production secrets are stored in GitHub's encrypted secrets, scoped to my `prod` environment for protection.
2.  **Inject:** During a deployment, the GitHub Actions workflow reads the secrets and writes them to temporary `.env` files inside the runner.
3.  **Generate & Apply:** A key script takes these `.env` files and uses `kubectl` to build a Kubernetes `Secret` manifest in memory. It runs a `kubectl create secret --from-env-file=... --dry-run=client -o yaml`, which outputs the YAML definition without creating anything. This YAML is then piped directly to `kubectl apply -f -`. This `apply` command is idempotent: it will create the secret if it doesn't exist or update it if it does.

    This "upsert" method is the core of the process, ensuring the cluster's secrets are always in sync with what's in GitHub.

    ::ProseGithub
    ---
    githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/scripts/apply-secrets.sh#L41
    language: yaml
    maxHeight: 400
    ---
    ::

4.  **Consume:** Once the secrets are safely stored in the cluster as `Secret` objects, applications can use them in two standard ways:
    *   **As Volume Mounts:** The secret's data is mounted as files into the container's filesystem. This is ideal for configuration files or keys.
    *   **As Environment Variables:** The secret's data is exposed to the application as environment variables.

There are also scenarios where I had to write secrets as ConfigMap entries or directly into values files due to limitations of third-party charts. In such cases, I leverage Helm's Go templating capabilities.

It is **helm templates** that are powered by Go’s built-in `text/template` engine, which supports logic like conditionals, loops, and variable interpolation. To extend this functionality, Helm includes its own commands, like [`lookup`](https://github.com/helm/helm/blob/main/pkg/engine/lookup_func.go), AND the [Sprig](https://masterminds.github.io/sprig/) library, which adds a rich set of helper functions—such as `default`, `quote`, `toYaml`, and more. Combined, these tools make it easy to dynamically render Kubernetes manifests based on values and context.

It is worth noticing that **helmfile** also supports using template grammar with values file, and able to processes `.gotmpl` files with handy functions like `exec`, which basically just allows any command!

For example, where I needed to generate a list of users and passwords for Redis without a dedicated field for ACL settings from secret or file, I could use `lookup` to fetch a pre-existing Secret containing the credentials and then format them as required in the value file applied to the chart.

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/db/redis.values.yaml.gotmpl#L22
language: yaml
maxHeight: 400
---
::

The programmatic __masking of secret values__ in GitHub Actions logs (as shown below) remains a crucial safety net, ensuring that even when secrets are processed in templates, they are redacted from the output.

::ProseGithub
---
githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/.github/workflows/cd.yml#L69
language: yaml
maxHeight: 400
---
::

However, notice that when secrets are SHA encrypted, their post-processed values might still be exposed. So dynamically write secrets to manifests shouldn't be considered as a recommended practice.

# What's next

This combination of Helmfile for environment configuration and a scripted `kubectl` workflow for secrets provides a robust, secure, and maintainable way to manage deployments.

Looking ahead, I plan to delve into more specific aspects of this hosting-with-k3s journey:

1.  **Cert-Manager Deep Dive:** A closer look at `cert-manager` for automated certificate provisioning, including strategies for replicating certificates across namespaces.
2.  **Docker Mailserver & Common Pitfalls:** Setting up a robust Docker-based mail server behind a proxy and navigating common challenges in self-hosting.
3.  **Customized Backend & AI Integration:** Exploring how to integrate a simple model server, potentially leveraging models like Qwen, as a customized backend for applications.
