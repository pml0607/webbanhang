# Stage 1: Build & Restore
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["WebBanHang.csproj", "./"]
COPY ["WebBanHang.Tests/WebBanHang.Tests.csproj", "WebBanHang.Tests/"]
RUN dotnet restore "WebBanHang.csproj"
RUN dotnet restore "WebBanHang.Tests/WebBanHang.Tests.csproj"

COPY . .

# Stage 2: Test Runner (Dùng để chạy Unit Test độc lập hoặc trong CI/CD)
FROM build AS test-runner
RUN dotnet test "WebBanHang.Tests/WebBanHang.Tests.csproj" -c Release --no-restore --verbosity normal

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "WebBanHang.csproj" -c Release -r linux-x64 --self-contained true -o /app/publish

# Stage 4: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

COPY --from=publish /app/publish .
RUN chmod +x ./WebBanHang
ENTRYPOINT ["./WebBanHang"]
