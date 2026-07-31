pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        VITE_API_URL = credentials('vite-api-url')
        VITE_SOCKET_URL = credentials('vite-socket-url')
        IMAGE_CLIENT = "charanbavaji/u2collab-client"
        IMAGE_SERVER = "charanbavaji/u2collab-server"
        GIT_SHA = "${GIT_COMMIT.take(7)}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // --- NEW: Assignment #4 - parallel test stages ---
        stage('Testing Suite') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        echo "Running React Tests"
                        // real version later: sh 'cd client && npm test'
                    }
                }
                stage('Backend Tests') {
                    steps {
                        echo "Running Java Tests"
                        // real version later: sh 'cd server && npm test'
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

        // --- NEW: Assignment #4 - manual approval gate before Deploy ---
        stage('Production Approval') {
            steps {
                // timeout guards against the pipeline (and its executor) hanging forever
                // if nobody clicks Approve -- good practice beyond the base assignment ask
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
                 body: "Build ${env.BUILD_NUMBER} (commit ${GIT_SHA}) failed. Automatically rolled back to last known good image recorded in current-deploy.txt. Check Jenkins console output for details."
        }
        always {
            sh 'docker logout'
        }
    }
}
