FROM node:22-slim
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY ./.output/. /app 
# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

COPY ./docker.entrypoint.sh /app/
# Set the entrypoint to our new script
ENTRYPOINT ["/app/docker.entrypoint.sh"]

CMD ["node", "/app/server/index.mjs"]