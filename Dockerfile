#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["ELibrary.csproj", "."]
RUN dotnet restore "./ELibrary.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "ELibrary.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ELibrary.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Dotnet publish does not include ClientApp/build
RUN rm -r ClientApp
COPY ./ClientApp/build ./ClientApp/build
ENTRYPOINT ["dotnet", "ELibrary.dll"]