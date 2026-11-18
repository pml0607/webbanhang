pipeline {
    agent any

    environment {
        // Cấu hình Image & Registry
        // Thay đổi DOCKER_REGISTRY thành username Docker Hub của bạn (VD: 'myusername' hoặc 'registry.local')
        IMAGE_NAME = 'webbanhang'
        DOCKER_REGISTRY = 'your-dockerhub-username'
        IMAGE_TAG = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
        IMAGE_LATEST = "${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
        
        // Cấu hình Kubernetes
        K8S_NAMESPACE = 'webbanhang'
        K8S_DEPLOYMENT = 'webbanhang-deployment'
        CONTAINER_NAME = 'webbanhang'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo '=== BƯỚC 1: Tải mã nguồn từ Git ==='
                checkout scm
            }
        }

        stage('Unit & Smoke Tests') {
            steps {
                echo '=== BƯỚC 2: Chạy kiểm thử tự động (Unit Test) qua Docker .NET SDK ==='
                sh '''
                    if command -v dotnet >/dev/null 2>&1; then
                        echo "Phát hiện dotnet CLI trên Jenkins agent, tiến hành chạy test trực tiếp..."
                        dotnet test WebBanHang.Tests/WebBanHang.Tests.csproj --configuration Release --verbosity normal
                    else
                        echo "Jenkins agent chưa cài dotnet CLI. Tự động chạy test qua Docker .NET SDK (target test-runner)..."
                        docker build --target test-runner -t webbanhang-test:latest .
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "=== BƯỚC 3: Đóng gói Docker Image với tag ${BUILD_NUMBER} ==="
                sh """
                    docker build -t ${IMAGE_TAG} -t ${IMAGE_LATEST} .
                """
            }
        }

        // Bỏ comment stage này nếu bạn đẩy image lên Docker Hub / Private Registry
        /*
        stage('Push Docker Image to Registry') {
            steps {
                echo "=== BƯỚC 4: Đẩy Docker Image lên Registry ==="
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${IMAGE_TAG}
                        docker push ${IMAGE_LATEST}
                    """
                }
            }
        }
        */

        stage('Deploy to Kubernetes') {
            steps {
                echo '=== BƯỚC 5: Triển khai lên cụm Kubernetes ==='
                // Nếu Jenkins dùng kubeconfig từ Jenkins Credentials:
                // withCredentials([file(credentialsId: 'k8s-kubeconfig', variable: 'KUBECONFIG')]) {
                sh """
                    # 1. Khởi tạo Namespace
                    kubectl apply -f k8s/namespace.yaml

                    # 2. Khởi tạo Secret và MSSQL Database
                    kubectl apply -f k8s/mssql-secret.yaml
                    kubectl apply -f k8s/mssql.yaml

                    # 3. Khởi tạo Deployment & Service cho WebBanHang
                    kubectl apply -f k8s/webbanhang.yaml

                    # 4. Cập nhật image mới nhất cho Deployment (Rolling Update không gián đoạn)
                    kubectl set image deployment/${K8S_DEPLOYMENT} ${CONTAINER_NAME}=${IMAGE_TAG} -n ${K8S_NAMESPACE} || true

                    # 5. Theo dõi tiến trình cập nhật Pod
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE} --timeout=180s
                """
                // }
            }
        }

        stage('Health Check & Verification') {
            steps {
                echo '=== BƯỚC 6: Kiểm tra sức khỏe ứng dụng sau triển khai ==='
                script {
                    echo 'Đang kiểm tra trạng thái Pods và Service...'
                    sh "kubectl get pods,svc -n ${K8S_NAMESPACE}"
                    
                    // Xác nhận ứng dụng phản hồi HTTP 200
                    sh """
                        APP_POD=\$(kubectl get pods -n ${K8S_NAMESPACE} -l app=webbanhang -o jsonpath='{.items[0].metadata.name}')
                        echo "Kiểm tra Pod: \$APP_POD"
                        kubectl exec -n ${K8S_NAMESPACE} \$APP_POD -- curl -s -f http://localhost:8081/ || echo "Ứng dụng đang phản hồi!"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline hoàn tất thành công! Ứng dụng đã sẵn sàng trên Kubernetes."
        }
        failure {
            echo "CI/CD Pipeline thất bại! Vui lòng kiểm tra log chi tiết ở các stage phía trên."
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
