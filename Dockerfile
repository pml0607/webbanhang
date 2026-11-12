# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["WebBanHang.csproj", "./"]
RUN dotnet restore "WebBanHang.csproj"

COPY . .
RUN dotnet publish "WebBanHang.csproj" -c Release -r linux-x64 --self-contained true -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

COPY --from=build /app/publish .
RUN chmod +x ./WebBanHang
ENTRYPOINT ["./WebBanHang"]
