FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

COPY ./publish .
RUN chmod +x ./WebBanHang
ENTRYPOINT ["./WebBanHang"]
