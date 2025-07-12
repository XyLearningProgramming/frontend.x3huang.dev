---
title: 'From Bare-metal to Kubernetes 2: A Push-Based GitOps Pipeline' 
description: "Why I chose a push-based CI/CD model with GitHub Actions for my K3s cluster, and a look at the high-level architecture that automates my deployments."
headline: '' 
date: '2025-07-12T12:00:00' 
dateUpdated: '2025-07-13T00:00:00'
published: true 
author: 'Xinyu' 
tags: ['self-host', 'k8s', 'vps', 'ci-cd', 'github-actions']
readTime: 9
image:
  src: '/images/20250712_sh2_img0_github.png'
  alt: 'Push-Based GitOps with Github Actions'
---

**TL;DR:** I set up a push-based CI/CD pipeline using GitHub Actions to automatically deploy my applications to a k8s cluster (k3s distro.). This approach avoids adding extra agents like ArgoCD to my resource-constrained VPS. 

It’s a __lean, effective__ setup for personal projects that I control completely from my Git repository.

::RepoGithub
---
url: https://github.com/XyLearningProgramming/helm.x3huang.dev
description: Charts for my site infrastructure, mixing custom and third-party ones.
---
::

::RepoGithub
---
url: https://github.com/XyLearningProgramming/frontend.x3huang.dev
description: My blog's repo, which serves as an example of a service deployed by the pipeline.
---
::

> This article covers the "why" behind my CI/CD choices for a self-hosted Kubernetes project. It’s not a step-by-step tutorial, but a look at the trade-offs and the resulting architecture.

### 1. The Automation Goals

After getting my cluster running, the next logical step was to automate deployments. I wanted a system that would:

- **Deploy automatically the whole infra.** to a desired final state on a merge to my main branch.
- **Manage releases**, allowing for history, rollbacks, and safe, component-level updates.
- **Include a manual approval checkpoint** for production deployments.
- **Keep a small memory footprint**, minial extra setup inside k8s, only updating changed components, and suitable for a low-budget VPS.

### 2. Push vs. Pull: Choosing a Path

When deploying to Kubernetes, the classic and major debate is "push" vs. "pull."

| Approach                | Key Players             | 👍 Pros                                                                                                     | 👎 Cons                                                                                                       |
| :---------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Push-Based (CI)**     | Jenkins, GitHub Actions | Lighter footprint on the cluster (no agent needed). Highly flexible and customizable workflows.            | Requires storing cluster credentials in the CI system. Can lead to state drift if changes are made manually. |
| **Pull-Based (GitOps)** | FluxCD, ArgoCD          | Git is the single source of truth. Automatically detects and corrects drift. More secure credential model. | Requires an agent running in the cluster (consumes resources). Can be more complex to set up initially.      |

For my project, a **push-based** model with **GitHub Actions** was the clear winner. It requires no extra daemons inside my already resource-constrained cluster, saving precious memory and simplifying the setup.

I also chose to interact directly with the Kubernetes API rather than SSHing into the server. This keeps the VPS clean, as no extra tools like `helm` or `helmfile` need to be installed on it. To keep this secure, I've locked down the API endpoint to a whitelist of trusted IPs.

### 3. The Final Workflow

Here’s a high-level look at the pipeline I landed on:

::Image
---
src: /images/20250712_sh2_img1.jpg
alt: Push-Based GitOps (CD Pipeline) for k8s Cluster
size: large
---
::

The process is straightforward:
1.  A pull request triggers the CI workflow, which runs tests and linting.
2.  Merging to the `main` branch triggers the CD workflow, which first requires my manual approval via **GitHub Environments**.
3.  When needed, the CD job builds a new Docker image, tags it with the Git commit SHA, and pushes it to a container registry.
4.  Finally, the job uses `helmfile` to deploy the new release to the cluster, applying all the necessary configurations. 

### 4. How Tools Solve Puzzle

With this setup, my initial goals were met by combining a few key tools, each with a specific job:

- **Automated, stateful deployments:** This is the core strength of **[Helm](https://helm.sh/docs/topics/architecture/)**. It packages applications into charts and manages them as releases within Kubernetes. When running `helm upgrade`, Helm compares the new chart with the last deployed release. It only applies changes to the resources that have actually been modified, making deployments efficient. For a `Deployment`, changing the pod template automatically triggers a safe, rolling update.

    However, sometimes changing `ConfigMap` will **not** trigger an update without additional settings. And for special settings, eg. `initdb` script inside `bitnami/postgres`, image may have logic speficically stating to ignore changes to avoid unexpected operations to the existing storage.

    ::ProseGithub
    ---
    githubUrl: https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/db/postgres.values.yaml.gotmpl#L61
    description: Script change will not apply automatically when redeploying.
    maxHeight: 300
    ---
    ::

    A common pattern to ensure deployments restart when a dependency like a `ConfigMap` changes is to inject a checksum of the config into the deployment's annotations. When the config changes, the checksum changes, which in turn triggers a rollout. But still, this won't solve the postgres initdb script issue mentioned above.

    ```yaml[deployment.yaml]
    # In your deployment.yaml template
    spec:
    template:
        metadata:
        annotations:
            checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    # ...
    ```

- **Manual approval & CI/CD orchestration:** **[GitHub Actions](https://docs.github.com/en/actions)** is the engine driving the pipeline. The workflow is triggered on a push to `main`, but I use **[GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)** to create a manual approval gate for my `prod` environment. This prevents accidental deployments and gives me a final checkpoint.

- **Managing the whole fleet:** This is where **[Helmfile](https://helmfile.dev/)** shines. My infrastructure isn't just one application; it's a collection of charts (Traefik, cert-manager, my blog, databases, etc.). Helmfile lets me define this entire stack in a single declarative `helmfile.yaml`. 

    Instead of running multiple `helm` commands, I run one: `helmfile apply`. It orchestrates deploying or updating all the charts in the correct order. It's "infrastructure as code" for your Helm releases. 

    Also, I found `helmfile` quite useful for multi-env management, which I'll explain in my next article.

### What's Next?

This setup provides a solid, automated foundation for my projects. But the real magic is in the details. In the [next article](/blogs/from-bare-metal-to-kubernetes-3-cicd-tips-for-managing-configs-and-secrets), I'll dive into how I manage environment-specific configurations and handle secrets securely within this pipeline.
