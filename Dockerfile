FROM composer:2 AS composer-stage
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

FROM php:8.4-cli AS builder

RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
COPY --from=composer-stage /app/vendor ./vendor
COPY --from=composer-stage /app/bootstrap/cache ./bootstrap/cache

ARG VITE_APP_NAME="NCSSM-M Forks"
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN npm ci && npm run build

FROM serversideup/php:8.4-fpm-nginx AS production

COPY --chown=www-data:www-data . /var/www/html
COPY --from=composer-stage --chown=www-data:www-data /app/vendor /var/www/html/vendor
COPY --from=composer-stage --chown=www-data:www-data /app/bootstrap/cache /var/www/html/bootstrap/cache
COPY --from=builder --chown=www-data:www-data /app/public/build /var/www/html/public/build

ENV PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_STORAGE_LINK=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    AUTORUN_LARAVEL_MIGRATION_SEED=true \
    AUTORUN_LARAVEL_CONFIG_CACHE=true \
    AUTORUN_LARAVEL_ROUTE_CACHE=true \
    AUTORUN_LARAVEL_VIEW_CACHE=true \
    AUTORUN_LARAVEL_EVENT_CACHE=true
