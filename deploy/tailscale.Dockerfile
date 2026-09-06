# Tailscale Funnel 용 이미지.
#
# 공식 이미지에 serve 설정만 구워 넣은 것입니다. compose 에서 bind mount 로
# 붙이지 않는 이유는 mariadb 와 같습니다 — self-hosted 러너가 checkout 한 경로는
# 러너 컨테이너 내부 경로여서 호스트 도커 데몬이 찾지 못합니다.
#
# 설정을 이미지에 넣어두면 상태 볼륨이 날아가도 재기동 시 스스로 복구됩니다.
#
# 빌드 컨텍스트는 ./deploy 입니다.
#
# ${TS_CERT_DOMAIN} 은 컨테이너 기동 시 tailscale 이 실제 도메인
# (예: suwon-es.tailxxxx.ts.net) 으로 치환합니다.

FROM tailscale/tailscale:stable

COPY tailscale/serve.json /config/serve.json
