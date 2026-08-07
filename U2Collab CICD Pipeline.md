# U2Collab — Jenkins CI/CD Pipeline with Docker

End-to-end CI/CD pipeline for the U2Collab MERN application using Jenkins, Docker, and two split AWS EC2 instances (Jenkins build server + Deploy target). Every manually-triggered build runs tests in parallel, builds and pushes Docker images, pauses for manager approval, deploys via SSH, runs a health check, and auto-rolls back on failure.

---

## 🗺️ Pipeline Overview

```
Manual trigger in Jenkins ("Build Now")
            │
            ▼
    ┌───────────────────────────────────────────┐
    │              Jenkins Pipeline              │
    │                                             │
    │  Stage 1: Checkout                         │
    │  Stage 2: Testing Suite  ─┬─ Frontend Tests │  (parallel)
    │                           └─ Backend Tests  │
    │  Stage 3: Build Client Image               │
    │  Stage 4: Build Server Image               │
    │  Stage 5: Push Images to DockerHub         │
    │  Stage 6: Production Approval  ⏸ (manual)  │  <- pipeline freezes here
    │  Stage 7: Deploy (SSH → Deploy EC2)        │
    │  Stage 8: Health Check & Record            │
    └───────────────────────────────────────────┘
            │
       ┌────┴────┐
   success     failure
       │            │
       ▼            ▼
  Email:       Auto-rollback to last known
  SUCCESS +    good image (from current-deploy.txt)
  mock Slack   → re-check health → Email: FAILED
  ping         + mock dev-team alert
            │
            ▼
    Application live on Deploy EC2
    (http://3.221.197.232.nip.io:5173)
```

---

## 🏗️ Infrastructure

| Component | Details |
|-----------|---------|
| **Jenkins Server** | Amazon Linux 2023, `c7i-flex.large`, Jenkins 2.555.3, Java 21 (Corretto) |
| **Deploy Server** | Separate EC2, `t2.small`, holds the Elastic IP |
| **Elastic IP** | `3.221.197.232` (on Deploy EC2, not Jenkins — kept stable for OAuth) |
| **Jenkins Port** | 8080 |
| **DockerHub** | `charanbavaji/u2collab-client`, `charanbavaji/u2collab-server` |
| **Deployment method** | `docker compose` on the Deploy EC2, driven remotely over SSH from Jenkins |

Jenkins and the Deploy target are intentionally split across two instances — Jenkins can be rebuilt/resized without touching the live app, and the Elastic IP stays fixed on the Deploy box so the OAuth callback domain (`nip.io`) never changes.

---

## 🔧 Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        VITE_API_URL    = credentials('vite-api-url')
        VITE_SOCKET_URL = credentials('vite-socket-url')
        IMAGE_CLIENT    = "charanbavaji/u2collab-client"
        IMAGE_SERVER    = "charanbavaji/u2collab-server"
        GIT_SHA         = "${GIT_COMMIT.take(7)}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Testing Suite') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        echo "Running React Tests"
                    }
                }
                stage('Backend Tests') {
                    steps {
                        echo "Running Node Tests"
                    }
                }
            }
        }

        stage('Build Client Image') {
            steps {
                sh """
                    docker build \
                      --build-arg VITE_API_URL=${VITE_API_URL} \
                      --build-arg VITE_SOCKET_URL=${VITE_SOCKET_URL} \
                      -t ${IMAGE_CLIENT}:${GIT_SHA} \
                      -t ${IMAGE_CLIENT}:latest \
                      ./client
                """
            }
        }

        stage('Build Server Image') {
            steps {
                sh """
                    docker build \
                      -t ${IMAGE_SERVER}:${GIT_SHA} \
                      -t ${IMAGE_SERVER}:latest \
                      ./server
                """
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDS_PSW} | docker login -u ${DOCKERHUB_CREDS_USR} --password-stdin
                    docker push ${IMAGE_CLIENT}:${GIT_SHA}
                    docker push ${IMAGE_CLIENT}:latest
                    docker push ${IMAGE_SERVER}:${GIT_SHA}
                    docker push ${IMAGE_SERVER}:latest
                """
            }
        }

        stage('Production Approval') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: 'Deploy to Production?', ok: 'Approve'
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['deploy-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@3.221.197.232 '
                            cd /opt/u2collab &&
                            echo "CLIENT_TAG=${GIT_SHA}" > .env &&
                            echo "SERVER_TAG=${GIT_SHA}" >> .env &&
                            docker compose down --remove-orphans || true &&
                            docker compose pull &&
                            docker compose up -d
                        '
                    """
                }
            }
        }

        stage('Health Check & Record') {
            steps {
                sshagent(['deploy-ssh-key']) {
                    sh """
                        sleep 10
                        ssh -o StrictHostKeyChecking=no ec2-user@3.221.197.232 '
                            curl -sf http://localhost:5000/api/health > /dev/null &&
                            echo "${GIT_SHA}" > /opt/u2collab/current-deploy.txt
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: 'charanbavaji.official@gmail.com',
                 subject: "U2Collab Pipeline SUCCESS - Build #${env.BUILD_NUMBER}",
                 body: "Build ${env.BUILD_NUMBER} deployed successfully. Commit: ${GIT_SHA}"
            echo "Success: Deployment passed! Sending Slack ping..."
        }
        failure {
            sshagent(credentials: ['deploy-ssh-key']) {
                sh """
                    ssh -o StrictHostKeyChecking=no ec2-user@3.221.197.232 '
                        cd /opt/u2collab &&
                        LAST_GOOD=\$(cat current-deploy.txt) &&
                        echo "CLIENT_TAG=\$LAST_GOOD" > .env &&
                        echo "SERVER_TAG=\$LAST_GOOD" >> .env &&
                        docker compose down --remove-orphans &&
                        docker compose pull &&
                        docker compose up -d &&
                        sleep 10 &&
                        curl -sf http://localhost:5000/api/health
                    '
                """
            }
            mail to: 'charanbavaji.official@gmail.com',
                 subject: "U2Collab Pipeline FAILED - Auto-rollback triggered - Build #${env.BUILD_NUMBER}",
                 body: "Build ${env.BUILD_NUMBER} (commit ${GIT_SHA}) failed. Automatically rolled back to last known good image recorded in current-deploy.txt."
            echo "Alert: Pipeline failed! Sending email to dev-team@company.com..."
        }
        always {
            sh 'docker logout'
        }
    }
}
```

---

## 🔑 Jenkins Credentials Setup

| Credential ID | Type | Used For |
|--------------|------|----------|
| `dockerhub-creds` | Username & Password | DockerHub login |
| `deploy-ssh-key` | SSH Username with Private Key | SSH into the Deploy EC2 |
| `vite-api-url` | Secret Text | `VITE_API_URL` build arg (baked into client bundle) |
| `vite-socket-url` | Secret Text | `VITE_SOCKET_URL` build arg |

Server secrets (`MONGO_URI`, OAuth keys) live in `/opt/u2collab-secrets/server.env` **on the Deploy EC2 itself**, outside the Jenkins workspace — not passed through Jenkins credentials at all, so they're never in build logs or the Jenkins controller.

---

## 🚦 Manual Approval Gate — Why It Matters

Adding a `Production Approval` stage before `Deploy` turns this from "fully automatic on every push" into "automatic up to the point of risk, human-gated after that." A few concrete reasons this matters in a real team, beyond just satisfying a compliance checkbox:

- **Blast radius control** — building and pushing images is fully reversible and has zero effect on the live app. Actually deploying is not free to undo instantly (even with the rollback logic here, there's a window of downtime/inconsistency). Gating the *risky* half of the pipeline, not the whole thing, keeps CI fast while still protecting production.
- **Timing control** — a manager can hold a deploy until a safe window (e.g., not during peak traffic, not right before an on-call handoff), without blocking developers from merging and letting CI validate their code in the meantime.
- **Accountability** — the approval click is logged with a username and timestamp in Jenkins, giving a clear audit trail of who authorized each production release — useful for compliance and for incident postmortems.
- **A cheap safety net, not a bottleneck** — because everything up to the gate (tests, build, push) still runs automatically and in parallel where possible, the human step only adds friction at the one point where friction is actually wanted.

The tradeoff: it does mean deploys can't happen unattended (e.g., middle-of-the-night auto-deploys aren't possible without someone approving), and an `input` step left unattended can hold a Jenkins executor — mitigated here with a 30-minute `timeout` so a forgotten approval doesn't block the queue indefinitely.

---

## 🚨 Key Challenges & Solutions

### 1. Vite Build-time vs Runtime Variables
**Problem:** Client container was live but API calls failed — `VITE_API_URL` was undefined in the bundle.
**Root cause:** Vite compiles env vars into the static bundle at build time, not runtime.
**Fix:** Pass them as `--build-arg` during `docker build`, not as container runtime env vars.

### 2. MongoDB URI Quoting
**Problem:** `MONGO_URI` was failing to parse correctly from the env file.
**Fix:** Quote the URI value and load it via `--env-file` rather than inline `-e` flags.

### 3. Google & GitHub OAuth Rejecting a Raw IP
**Problem:** OAuth providers rejected `http://3.221.197.232` as a valid callback URL.
**Fix:** Used `nip.io` (`http://3.221.197.232.nip.io`) — resolves to the same IP but is accepted as a domain by OAuth providers.

### 4. Docker Socket Permission Denied
**Problem:** Pipeline failed at the Docker build stage with `permission denied ... docker.sock`.
**Root cause:** The `jenkins` Linux user wasn't a member of the `docker` group, so it couldn't talk to the Docker daemon.
**Fix:** `sudo usermod -aG docker jenkins` + `sudo systemctl restart jenkins` (group membership only applies to new sessions, so a restart is required).

### 5. Split-Instance Deploy & Container Name Conflicts
**Problem:** After separating Jenkins and Deploy onto two EC2 instances, redeploys sometimes failed on leftover containers.
**Fix:** Added `--remove-orphans` to `docker compose down` in the Deploy stage.

### 6. Stuck Build Queue After an EC2 Resize
**Problem:** After temporarily resizing the Jenkins EC2 down to `t2.small`, builds got stuck indefinitely at "Waiting for next available executor" even though the Jenkins service itself was healthy.
**Fix:** Resized back to `c7i-flex.large` — the smaller instance didn't have enough resources to schedule the executor properly.

---

## 📊 Pipeline Stages

| Stage | Purpose |
|-------|---------|
| Checkout | Pull latest code |
| Testing Suite (parallel) | Frontend + backend tests run simultaneously |
| Build Client/Server Image | Docker images built with SHA + `latest` tags |
| Push to DockerHub | Both tags pushed for each image |
| Production Approval | Pipeline pauses for manual sign-off |
| Deploy | SSH into Deploy EC2, update `.env`, `docker compose up -d` |
| Health Check & Record | Confirms `/api/health`, records the deployed SHA for rollback |
| Post: success/failure | Email notification (+ mock Slack/alert echoes); auto-rollback on failure |

---

## 📚 Tools & Technologies Used

| Tool | Purpose |
|------|---------|
| Jenkins | CI/CD automation, approval gates |
| Docker & Docker Compose | Containerization and multi-container orchestration on Deploy EC2 |
| DockerHub | Image registry |
| AWS EC2 (×2) | Split Jenkins build server + Deploy target |
| GitHub | Source control |
| nip.io | OAuth-compatible domain wrapper for the Elastic IP |
| Amazon Linux 2023 | Server OS |

---

## 👨‍💻 Author

**Charan Bavaji**
- GitHub: [github.com/Charan-bavaji](https://github.com/Charan-bavaji)
- LinkedIn: [linkedin.com/in/charan-r-884217221](https://www.linkedin.com/in/charan-r-884217221/)
- DockerHub: [hub.docker.com/u/charanbavaji](https://hub.docker.com/u/charanbavaji)

---

## 📸 Screenshots

<img width="1920" height="1080" alt="Screenshot (29)" src="https://github.com/user-attachments/assets/5c8ce9f3-68d1-4e2c-a1ec-3be470064894" />

<img width="1920" height="1080" alt="Screenshot (30)" src="https://github.com/user-attachments/assets/7d11bcda-c1b3-449c-8fbc-f5896ebb1e15" />

