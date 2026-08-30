# 프론트엔드 정적 빌드 -> nginx 이미지.
# nginx 가 /api 를 backend 컨테이너로 프록시하므로 브라우저에서 보면 same-origin 입니다.
# 덕분에 CORS 설정이 필요 없고, 번들에 NAS IP 가 박히지 않아 나중에 DDNS/HTTPS 로
# 바꿀 때 재빌드가 필요 없습니다.
#
# ⚠️ VITE_* 값은 "빌드 타임"에 번들에 구워집니다. 런타임 환경변수로는 바꿀 수 없습니다.

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# production = 실제 백엔드 API 사용 / test = 목업(fake-db) 사용
ARG VITE_MODE=production

# axios baseURL. '/api' 로 두면 nginx 프록시를 타고 same-origin 으로 동작합니다.
# (src/plugins/axios.js: baseURL = VITE_API_BASE_URL || '')
ARG VITE_API_BASE_URL=/api

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build --mode ${VITE_MODE}

# 빌드 산출물이 실제로 생겼는지 확인 (조용히 빈 이미지가 나가는 것을 막습니다)
RUN test -f dist/index.html || { echo "ERROR: dist/index.html 이 없습니다. 빌드 실패." >&2; exit 1; }

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
