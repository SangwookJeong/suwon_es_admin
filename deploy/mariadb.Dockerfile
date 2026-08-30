# 스키마를 이미지에 구워 넣은 MariaDB.
#
# 이렇게 하는 이유: compose 에서 스키마를 bind mount 하면
# ("./backend/sql/001_schema.sql:/docker-entrypoint-initdb.d/...")
# self-hosted 러너가 checkout 한 경로는 러너 컨테이너 내부 경로라서
# 호스트 도커 데몬이 그 경로를 찾지 못하고 빈 디렉터리를 마운트합니다.
# 그러면 스키마 초기화가 "조용히" 실패합니다. bind mount 를 없애면 이 문제가 사라집니다.
#
# 빌드 컨텍스트는 ./backend 입니다 (루트 .dockerignore 가 backend 를 제외하므로).
#
# ⚠️ /docker-entrypoint-initdb.d 스크립트는 데이터 디렉터리가 "비어 있을 때만" 실행됩니다.
#    즉 최초 1회만 적용됩니다. 이후 스키마 변경은 이 이미지를 다시 만들어도 반영되지 않고,
#    별도 마이그레이션(ALTER TABLE)을 실행해야 합니다.

FROM mariadb:10.11

COPY sql/001_schema.sql /docker-entrypoint-initdb.d/001_schema.sql
