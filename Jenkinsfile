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
    NPM_CACHE_VOL = "npm-cache"                 // named Docker volume for faster npm installs
    TRIVY_SEVERITY = "HIGH,CRITICAL"            // quality gate
    TRIVY_EXIT_CODE = "1"                       // fail build if findings at selected severities
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
          # Run the built image and probe it
          docker rm -f ttt-smoke >/dev/null 2>&1 || true
          docker run -d --rm --name ttt-smoke -p 8080:80 "$IMAGE"

          # Simple health check (static site): expect HTTP 200
          for i in $(seq 1 20); do
            if curl -fsS http://localhost:8080/ >/dev/null; then
              echo "Smoke OK"
              break
            fi
            echo "Waiting for container..."
            sleep 0.5
          done

          # Fail if curl never succeeded
          curl -fS http://localhost:8080/ >/dev/null

          # Cleanup
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
