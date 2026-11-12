pipeline {
    agent any
    environment {
        IMAGE_NAME = 'webbanhang'
        CONTAINER_NAME = 'webbanhang'
        NETWORK_NAME = 'monitoring-net'
        APP_PORT = '8081'
        DB_HOST = 'mssql-server'
        DB_PASS = 'YourStrong@Passw0rd'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }
        stage('Ensure Infrastructure') {
            steps {
                sh '''
                docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || docker network create ${NETWORK_NAME}
                docker inspect ${DB_HOST} >/dev/null 2>&1 || docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=${DB_PASS}" -p 1433:1433 --name ${DB_HOST} --network ${NETWORK_NAME} --restart unless-stopped -d mcr.microsoft.com/mssql/server:2022-latest
                '''
            }
        }
        stage('Docker Deploy') {
            steps {
                sh '''
                docker stop ${CONTAINER_NAME} >/dev/null 2>&1 || true
                docker rm -f ${CONTAINER_NAME} >/dev/null 2>&1 || true
                docker run -d --name ${CONTAINER_NAME} --network ${NETWORK_NAME} -p ${APP_PORT}:${APP_PORT} -e ConnectionStrings__DefaultConnection="Server=${DB_HOST},1433;Database=WebBanHangDb;User Id=sa;Password=${DB_PASS};TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=30;" --restart unless-stopped ${IMAGE_NAME}:latest
                '''
            }
        }
        stage('Verify & Health Check') {
            steps {
                script {
                    echo 'Waiting for application to be ready...'
                    sleep time: 10, unit: 'SECONDS'
                }
                sh 'curl --fail --silent --show-error http://${CONTAINER_NAME}:${APP_PORT}/'
                sh 'curl --fail --silent --show-error http://${CONTAINER_NAME}:${APP_PORT}/metrics'
                sh 'curl --fail --silent --show-error http://${CONTAINER_NAME}:${APP_PORT}/api/products'
            }
        }
    }
}
