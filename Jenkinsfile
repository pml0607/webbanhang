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
        stage('Restore') {
            steps {
                bat 'dotnet restore WebBanHang.sln'
            }
        }
        stage('Build') {
            steps {
                bat 'dotnet build WebBanHang.sln --configuration Release --no-restore'
            }
        }
        stage('Test') {
            steps {
                bat 'dotnet test WebBanHang.sln --configuration Release --no-build --verbosity normal'
            }
        }
        stage('Publish') {
            steps {
                bat 'dotnet publish WebBanHang.csproj --configuration Release -r linux-x64 --self-contained true --output .\\publish'
            }
        }
        stage('Docker Build') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:latest .'
            }
        }
        stage('Ensure Infrastructure') {
            steps {
                bat '''
                docker network inspect %NETWORK_NAME% >nul 2>&1 || docker network create %NETWORK_NAME%
                docker inspect %DB_HOST% >nul 2>&1 || docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=%DB_PASS%" -p 1433:1433 --name %DB_HOST% --network %NETWORK_NAME% --restart unless-stopped -d mcr.microsoft.com/mssql/server:2022-latest
                '''
            }
        }
        stage('Docker Deploy') {
            steps {
                bat '''
                docker stop %CONTAINER_NAME% >nul 2>&1 || echo No running container
                docker rm -f %CONTAINER_NAME% >nul 2>&1 || echo No existing container
                docker run -d --name %CONTAINER_NAME% --network %NETWORK_NAME% -p %APP_PORT%:%APP_PORT% -e ConnectionStrings__DefaultConnection="Server=%DB_HOST%,1433;Database=WebBanHangDb;User Id=sa;Password=%DB_PASS%;TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=30;" --restart unless-stopped %IMAGE_NAME%:latest
                '''
            }
        }
        stage('Verify & Health Check') {
            steps {
                script {
                    echo 'Waiting for application and database to be fully up...'
                    sleep time: 10, unit: 'SECONDS'
                }
                bat 'curl --fail --silent --show-error http://localhost:%APP_PORT%/'
                bat 'curl --fail --silent --show-error http://localhost:%APP_PORT%/metrics'
                bat 'curl --fail --silent --show-error http://localhost:%APP_PORT%/api/products'
            }
        }
    }
}
