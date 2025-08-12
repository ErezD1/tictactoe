pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    // If you have the AnsiColor plugin, uncomment:
    // ansiColor('xterm')
  }

  environment {
    IMAGE = "tictactoe:${env.BUILD_NUMBER}"
    NPM_CACHE_VOL = "npm-cache"
    TRIVY_SEVERITY = "HIGH,CRITICAL"
    TRIVY_EXIT_CODE = "1"
    PREVIEW_PORT = "8090"          // <— not 8080 (Jenkins)
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prep') {
      steps {
        sh '''
          # ensure a named npm cache volume exists (safe if it already does)
          docker volume create "${NPM_CACHE_VOL}" >/dev/null 2>&1 || true
        '''
      }
    }

    stage('Lint & Test') {
      steps {
        sh '''
          echo "PWD=$(pwd)"; ls -la

          # Run Node in a container. We mount:
          # - Jenkins home (for workspace files) via --volumes-from
          # - a named volume for npm cache to speed installs
          docker run --rm \
            --volumes-from jenkins \
            -v "${NPM_CACHE_VOL}:/root/.npm" \
            -w "$PWD" \
            -e NODE_OPTIONS=--experimental-vm-modules \
            node:20 bash -lc '
              if [ -f package-lock.json ]; then
                npm ci --no-audit --no-fund
              else
                npm install --no-audit --no-fund
              fi
              npm run lint
              npm run test:ci
            '
        '''
      }
      post {
        always {
          // Publish test results and coverage even if tests fail
          junit testResults: 'reports/junit.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'coverage/**', fingerprint: true, allowEmptyArchive: true
        }
      }
    }

    stage('Dockerfile Lint') {
      steps {
        // Non-blocking Dockerfile lint (good habit)
        sh '''
          docker run --rm -v "$PWD":/work hadolint/hadolint hadolint /work/Dockerfile || true
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t "$IMAGE" .'
      }
    }

  stage('Smoke Test') {
    steps {
      sh '''
        set -e
        docker rm -f ttt-smoke >/dev/null 2>&1 || true
        docker run -d --rm --name ttt-smoke "$IMAGE"

        # Probe the app without binding a host port:
        # use network=container:ttt-smoke so curl hits localhost:80 inside that container
        for i in $(seq 1 20); do
          if docker run --rm --network container:ttt-smoke curlimages/curl \
              curl -fsS http://localhost:80/ >/dev/null; then
            echo "Smoke OK"
            break
          fi
          echo "Waiting for container..."
          sleep 0.5
        done

        docker run --rm --network container:ttt-smoke curlimages/curl curl -fS http://localhost:80/ >/dev/null

        docker rm -f ttt-smoke >/dev/null 2>&1 || true
      '''
    }
  }


    stage('Security Scan (Trivy)') {
      steps {
        sh '''
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy:latest image \
              --severity "${TRIVY_SEVERITY}" \
              --exit-code "${TRIVY_EXIT_CODE}" \
              "$IMAGE"
        '''
      }
    }

    // Optional: push to a registry (GHCR, Docker Hub, etc.)
    // stage('Publish Image') {
    //   when { branch 'master' }
    //   steps {
    //     withCredentials([string(credentialsId: 'ghcr_pat', variable: 'GHCR_PAT')]) {
    //       sh '''
    //         echo "$GHCR_PAT" | docker login ghcr.io -u <your_user> --password-stdin
    //         docker tag "$IMAGE" ghcr.io/<your_user>/tictactoe:${BUILD_NUMBER}
    //         docker tag "$IMAGE" ghcr.io/<your_user>/tictactoe:latest
    //         docker push ghcr.io/<your_user>/tictactoe:${BUILD_NUMBER}
    //         docker push ghcr.io/<your_user>/tictactoe:latest
    //       '''
    //     }
    //   }
    // }
  }
  stage('Deploy to Preview') {
    steps {
      sh '''
        docker rm -f ttt-preview >/dev/null 2>&1 || true
        docker run -d --name ttt-preview -p ${PREVIEW_PORT}:80 "$IMAGE"
        echo "Preview running at: http://$(hostname -i | awk "{print \\$1}"):${PREVIEW_PORT}"
      '''
    }
  }

  post {
    always {
      // Show coverage HTML in Jenkins if you installed "HTML Publisher" plugin
      publishHTML(target: [
        reportName: 'Coverage',
        reportDir: 'coverage/lcov-report',
        reportFiles: 'index.html',
        keepAll: true, alwaysLinkToLastBuild: true, allowMissing: true
      ])
      cleanWs()
    }
  }
}
