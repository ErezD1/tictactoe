FROM nginx:1.27-alpine
RUN apk --no-cache upgrade libxml2
WORKDIR /usr/share/nginx/html
COPY index.html styles.css ./
COPY src ./src

# Optionally lock down default server tokens & add caching headers later
EXPOSE 80
