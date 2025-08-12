pipeline {
  agent any
  options { timestamps() }
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
            npm ci || npm install
            npm run lint
            npm run test:ci
          '
        '''
      }
      post {
        always {
          junit 'reports/junit.xml'
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
  }
  post { always { cleanWs() } }
}
