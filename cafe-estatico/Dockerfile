FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY index.html party-time.gif .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]