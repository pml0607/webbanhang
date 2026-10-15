pipeline {
    agent any
    environment {
        DEPLOY_DIR = 'C:\\wwwroot\\webbanhang'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm // Tải mã nguồn từ GitHub[cite: 3]
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
                bat 'dotnet publish WebBanHang.csproj --configuration Release --no-restore --output .\\publish'
            }
        }
        stage('Deploy') {
            steps {
                bat 'if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"'

                // Chỉ dùng text thường, không chứa ký tự đặc biệt
                bat 'echo He thong dang duoc cap nhat... > "%DEPLOY_DIR%\\app_offline.htm"'
                
                bat 'xcopy /Y /S /I .\\publish\\* "%DEPLOY_DIR%"'
                bat 'del "%DEPLOY_DIR%\\app_offline.htm"'
            }
        }
        stage('Verify') {
            steps {
                bat 'curl --fail --silent --show-error http://localhost/webbanhang'
            }
        }
    }
}