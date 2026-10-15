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
                bat 'dotnet restore' // Khôi phục thư viện NuGet[cite: 3]
            }
        }
        stage('Build') {
            steps {
                bat 'dotnet build --configuration Release --no-restore' // Biên dịch dự án[cite: 3]
            }
        }
        stage('Test') {
            steps {
                bat 'dotnet test --no-build --verbosity normal' // Chạy kiểm thử tự động[cite: 3]
            }
        }
        stage('Publish') {
            steps {
                bat 'dotnet publish -c Release -o ./publish' // Xuất bản ứng dụng[cite: 3]
            }
        }
        stage('Deploy') {
            steps {
                // Đặt app_offline.htm để IIS nhả file DLL
                bat "echo <html><body>Đang cập nhật hệ thống...</body></html> > ${DEPLOY_DIR}\\app_offline.htm"
                // Copy đè file publish vào IIS
                bat "xcopy /Y /S /I .\\publish\\* ${DEPLOY_DIR}"
                // Xóa app_offline.htm để app chạy lại
                bat "del ${DEPLOY_DIR}\\app_offline.htm"
            }
        }
        stage('Verify') {
            steps {
                bat 'curl -s -o NUL -w "%%{http_code}" http://localhost/webbanhang' // Kiểm tra HTTP code[cite: 3]
            }
        }
    }
}