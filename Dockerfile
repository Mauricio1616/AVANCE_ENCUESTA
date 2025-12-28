# Dockerfile para la aplicación de Encuestas

# Usamos nginx versión alpine para un contenedor ligero y rápido
FROM nginx:alpine

# Copiar la configuración personalizada de nginx (opcional, pero recomendada)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos de la aplicación al directorio de nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
