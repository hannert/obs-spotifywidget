# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7


FROM mcr.microsoft.com/mssql/server:2022-latest
USER root
# Use production node environment by default.
# ENV NODE_ENV=dev
ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=StrongPassw0rd
ENV DB_LOGIN=dev_test
ENV DB_PASSWORD=123
ENV DB_DATABASE=TestDB
ENV DB_USERS_TABLE=Users
ENV DB_SPOTIFY_TABLE=Test


# Install dos2unix functionality for converting CRLF file endings to LF
# RUN apt-get update && \
#     apt-get install -y dos2unix && \
#     apt-get clean
# Create a config directory
RUN mkdir -p /usr/config
WORKDIR /usr/config

# Bundle config source
COPY . /usr/config

# Grant permissions for to our scripts to be executable
RUN chmod +x /usr/config/entrypoint.sh
RUN chmod +x /usr/config/import-data.sh

# Convert all the file endings
# RUN dos2unix ./usr/entrypoint.sh

# Run the application as a non-root user.
USER mssql

# Run the application.
ENTRYPOINT ["./entrypoint.sh"]
