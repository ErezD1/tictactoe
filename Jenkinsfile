pipeline {
  agent any
  options {
    timestamps()
    ansiColor('xterm')
  }
  environment {
    APP_NAME = 'tictactoe'
    IMAGE = "tictactoe:${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Lint & Test') {
      steps {
        sh '''
          docker run --rm -v "$PWD":/work -w /work node:20 bash -lc '
            corepack enable || true
            npm ci || npm install
            npm run lint
            npm run test:ci
          '
        '''
      }
      post {
        always {
          junit 'reports/junit.xml'
          publishHTML(target: [
            reportDir: 'coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Coverage'
          ])
          archiveArtifacts artifacts: 'coverage/**', fingerprint: true
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t $IMAGE .'
      }
    }

    stage('Security Scan (Trivy)') {
      steps {
        sh '''
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL "$IMAGE"
        '''
      }
    }

    stage('(Optional) Smoke Deploy') {
      when { expression { return false } } // flip to true if you want to run locally
      steps {
        sh '''
          cid=$(docker run -d -p 8080:80 "$IMAGE")
          sleep 2
          curl -fsS http://localhost:8080 >/dev/null
          docker rm -f "$cid"
        '''
      }
    }
  }
  post {
    always { cleanWs() }
  }
}
