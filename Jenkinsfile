pipeline {
  agent any
  options { timestamps() }
  environment {
    IMAGE = "tictactoe:${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

  stage('Lint & Test') {
    steps {
      sh '''
        echo "PWD=$(pwd)"; ls -la
        docker run --rm --volumes-from jenkins -w "$PWD" \
          -e NODE_OPTIONS=--experimental-vm-modules \
          node:20 bash -lc '
            if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
            npm run lint
            npm run test:ci
          '
      '''
    }
    post {
      always {
        junit testResults: 'reports/junit.xml', allowEmptyResults: true
        archiveArtifacts artifacts: 'coverage/**', fingerprint: true, allowEmptyArchive: true
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
