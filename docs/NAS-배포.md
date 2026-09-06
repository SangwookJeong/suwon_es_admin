# NAS 배포 가이드 (처음부터)

Synology NAS에 아무것도 없는 상태에서 시작해, GitHub에 push하면 자동 배포되는 상태까지 만드는 순서입니다.

## 전체 그림

```
  개발 PC ──push──▶ GitHub ──▶ Actions(ubuntu 러너)
                                  │  이미지 4개 빌드 → GHCR 에 push
                                  │    suwon-es-web / -web:*-test / -api / -db
                                  ▼
                            NAS self-hosted 러너
                                  │  GHCR 에서 pull → docker compose up -d
                                  ▼
   브라우저 ──:8080──▶ frontend(nginx) ──/api──▶ backend:4000 ──▶ mariadb:3306
                                                        (LAN 에 노출 안 됨)
```

핵심 설계 두 가지입니다.

- **NAS에서 빌드하지 않습니다.** Synology CPU로 Vite 빌드는 느리고 OOM 위험이 있어, 빌드는 GitHub 호스티드 러너가 하고 NAS는 이미지를 pull만 합니다.
- **backend와 mariadb는 포트를 열지 않습니다.** 브라우저는 nginx의 `/api` 프록시로만 백엔드에 닿습니다. 그래서 CORS 설정이 필요 없고, DB/API가 LAN에 직접 노출되지 않습니다.

---

## 1. NAS에 Docker 설치

DSM 웹 → **패키지 센터** → `Container Manager` 검색 → 설치.
(DSM 6.x라면 이름이 `Docker`입니다)

## 2. SSH 켜기

DSM → **제어판 → 터미널 및 SNMP → SSH 서비스 활성화** (포트 22).

PC에서 접속합니다. `<NAS_IP>`는 DSM 로그인에 쓰는 그 주소입니다.

```bash
ssh <관리자계정>@<NAS_IP>
sudo -i          # 이후 명령은 root 로 실행합니다
docker version   # Container Manager 가 떠 있으면 버전이 나옵니다
docker compose version   # v2 여야 합니다
```

### `docker: 'compose' is not a docker command` 가 나오면

Container Manager 가 compose v2 **플러그인**을 깔아주지 않은 경우입니다. 흔합니다.
먼저 무엇이 있는지 확인합니다.

```bash
uname -m
docker-compose version 2>/dev/null || echo "standalone 없음"
ls /var/packages/ContainerManager/target/usr/bin/ 2>/dev/null | grep -i compose
ls /var/packages/Docker/target/usr/bin/ 2>/dev/null | grep -i compose
```

**`docker-compose` 가 `v2.x.x` 로 있으면** 하이픈 버전을 그대로 쓰면 됩니다. 문법은 같습니다.
이 문서의 `docker compose` 를 전부 `docker-compose` 로 바꿔 읽으세요.

**`1.x.x` 이거나 없으면** v2 를 직접 설치합니다.
이 저장소의 compose 파일은 최상위 `name:` 키를 쓰는데 v2 전용 기능이라 v1 로는 동작하지 않습니다.

```bash
mkdir -p /usr/local/lib/docker/cli-plugins

# uname -m 이 x86_64 인 경우 (인텔 NAS - 대부분)
curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose

# uname -m 이 aarch64 인 경우
# curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-aarch64 \
#   -o /usr/local/lib/docker/cli-plugins/docker-compose

chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version
```

> DSM 대규모 업데이트 후 이 파일이 사라질 수 있습니다. 그때는 위 3줄을 다시 실행하면 됩니다.

> **자동 배포는 이 문제와 무관합니다.** 워크플로의 `docker compose` 는 NAS 호스트가 아니라
> 러너 컨테이너(`myoung34/github-runner`) 안에서 실행되고 그 이미지에는 v2 가 들어 있습니다.
> 호스트 compose 가 필요한 건 6번(러너 등록)과 8번(DB 시드) 같은 수동 작업입니다.

## 3. 저장소 클론

```bash
mkdir -p /volume1/docker && cd /volume1/docker
git clone https://github.com/SangwookJeong/suwon_es_admin.git
cd suwon_es_admin
```

`git: command not found`가 나오면 패키지 센터에서 `Git Server`를 설치하거나, 아래처럼 압축본을 받습니다.

```bash
curl -L https://github.com/SangwookJeong/suwon_es_admin/archive/refs/heads/main.tar.gz | tar xz
mv suwon_es_admin-main suwon_es_admin && cd suwon_es_admin
```

## 4. GitHub Actions 시크릿 등록

**자동 배포는 NAS의 `.env`를 읽지 않습니다.** 러너가 checkout한 디렉터리에는 `.env`가 없기 때문입니다(`.gitignore`). DB 비밀번호와 JWT 시크릿은 GitHub에 등록한 값이 쓰입니다.

저장소 → **Settings → Secrets and variables → Actions → New repository secret** 에서 3개를 등록합니다.

| 이름 | 설명 |
|---|---|
| `MYSQL_ROOT_PASSWORD` | DB root 비밀번호 |
| `MYSQL_PASSWORD` | 앱 계정(`suwon_app`) 비밀번호 |
| `JWT_SECRET` | 로그인 토큰 서명 키. `openssl rand -hex 32` |

`MYSQL_DATABASE` / `MYSQL_USER`는 생략하면 `suwon_es_admin` / `suwon_app`이 됩니다.

> **이 값들은 나중에 바꾸기 어렵습니다.** DB 볼륨이 최초 생성될 때 비밀번호가 그대로 구워지기 때문입니다. 처음에 제대로 정하세요.

## 5. NAS에 `.env` 만들기

NAS의 `.env`는 **러너 등록**과 **수동 조작**에만 쓰입니다.

```bash
cp .env.example .env
vi .env
```

- `GH_RUNNER_REPO_URL` — 저장소 주소
- `GH_RUNNER_TOKEN` — GitHub **Settings → Developer settings → Personal access tokens (classic)** 에서 `repo` 권한으로 발급
- `MYSQL_*`, `JWT_SECRET` — 4번에서 등록한 값과 **똑같이** 채웁니다. 수동으로 compose를 돌릴 때 필요합니다.

## 6. self-hosted 러너 등록

```bash
docker compose -f deploy/github-runner-compose.yml up -d
docker compose -f deploy/github-runner-compose.yml logs -f   # Ctrl+C 로 빠져나옵니다
```

저장소 → **Settings → Actions → Runners** 에 `nas-runner`가 **Idle**로 뜨면 성공입니다.

호스트에 compose 를 못 깔았다면 `docker run` 으로도 동일하게 띄울 수 있습니다.

```bash
docker run -d --name nas-runner --restart unless-stopped \
  -e REPO_URL="https://github.com/SangwookJeong/suwon_es_admin" \
  -e ACCESS_TOKEN="<PAT>" \
  -e RUNNER_NAME=nas-runner \
  -e RUNNER_WORKDIR=/tmp/runner/work \
  -e LABELS=self-hosted,nas \
  -e DISABLE_AUTO_UPDATE=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v github-runner-work:/tmp/runner/work \
  myoung34/github-runner:latest
```

> 이 저장소는 public이고 NAS에 러너가 붙어 있습니다. 워크플로에 **`pull_request` 트리거를 절대 추가하지 마세요.** 외부인이 PR만으로 NAS에서 임의 코드를 실행할 수 있습니다. 현재는 `push`(main)와 `workflow_dispatch`만 걸려 있습니다. 저장소를 private으로 바꾸면 이 위험이 사라집니다.

## 7. 첫 배포

개발 PC에서 커밋하고 push하면 배포가 시작됩니다.

```bash
git add -A && git commit -m "feat: 학생 DB/API 추가 및 NAS 배포 구성"
git push origin main
```

저장소 **Actions** 탭에서 진행 상황을 봅니다. `build`(이미지 4개) → `deploy`(NAS) 순서로 돕니다. 첫 실행은 캐시가 없어 10~15분쯤 걸립니다.

## 8. DB 시드 (최초 1회)

스키마는 DB 컨테이너가 처음 뜰 때 자동으로 만들어집니다. 데이터는 직접 넣어야 합니다.

```bash
cd /volume1/docker/suwon_es_admin
docker compose -f deploy/docker-compose.nas.yml exec backend npm run seed
```

교사 53명 · 학생 179명 · 계정 2개가 들어갑니다. 이미 데이터가 있으면 건너뛰므로 여러 번 실행해도 안전합니다.

호스트에 compose 가 없으면 `docker exec` 로도 됩니다.

```bash
docker exec suwon-es-backend-1 npm run seed
```

제대로 들어갔는지 확인합니다.

```bash
# 테이블 5개: teachers, service_history, attendance, accounts, students
docker exec suwon-es-mariadb-1 \
  sh -c 'mariadb -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW TABLES" suwon_es_admin'

# 교사 53 / 학생 179 / 계정 2 가 나와야 정상
docker exec suwon-es-mariadb-1 sh -c 'mariadb -uroot -p"$MYSQL_ROOT_PASSWORD" -e \
  "SELECT (SELECT COUNT(*) FROM teachers) 교사, (SELECT COUNT(*) FROM students) 학생, (SELECT COUNT(*) FROM accounts) 계정" suwon_es_admin'
```

> compose 가 넣어주는 변수 이름은 `MYSQL_ROOT_PASSWORD` 입니다.
> mariadb 이미지가 `MARIADB_ROOT_PASSWORD` 도 인식하긴 하지만, 설정하지 않은 쪽은
> 컨테이너에 존재하지 않아 빈 값이 되고 `using password: NO` 로 거부당합니다.

## 9. 접속 확인

브라우저에서 `http://<NAS_IP>:8080`

| 계정 | 비밀번호 | 권한 |
|---|---|---|
| `seungjin` | `admin` | 관리자 |
| `sangouk` | `client` | 일반 |

> **첫 로그인 후 비밀번호를 바꾸세요.** 시드 계정은 데모용입니다.

목업 데모 페이지(백엔드·DB 없이 동작)를 같이 띄우려면:

```bash
docker compose -f deploy/docker-compose.nas.yml --profile demo up -d frontend-test
# → http://<NAS_IP>:8081
```

---

## 운영

### 상태 보기

```bash
cd /volume1/docker/suwon_es_admin
C="docker compose -f deploy/docker-compose.nas.yml"
$C ps
$C logs -f backend
```

### 백업

영속 데이터는 `mariadb_data` 볼륨 하나뿐입니다. 이것만 백업하면 됩니다.

```bash
docker compose -f deploy/docker-compose.nas.yml exec mariadb \
  sh -c 'exec mariadb-dump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines suwon_es_admin' \
  > /volume1/backup/suwon_es_$(date +%Y%m%d).sql
```

DSM **작업 스케줄러**에 매일 새벽으로 걸어두는 것을 권합니다.

### 복구

```bash
docker compose -f deploy/docker-compose.nas.yml exec -T mariadb \
  sh -c 'exec mariadb -uroot -p"$MYSQL_ROOT_PASSWORD" suwon_es_admin' \
  < /volume1/backup/suwon_es_20260830.sql
```

### 롤백

이미지는 커밋 SHA로도 태그되어 있습니다.

```bash
WEB_IMAGE=ghcr.io/sangwookjeong/suwon-es-web:<커밋SHA> \
API_IMAGE=ghcr.io/sangwookjeong/suwon-es-api:<커밋SHA> \
  docker compose -f deploy/docker-compose.nas.yml up -d
```

### 스키마 변경

`/docker-entrypoint-initdb.d` 스크립트는 **데이터 디렉터리가 비어 있을 때만** 실행됩니다. 즉 `001_schema.sql`을 고쳐도 이미 만들어진 DB에는 반영되지 않습니다.

새 테이블 추가는 `CREATE TABLE IF NOT EXISTS`라서 스크립트를 그대로 다시 실행하면 됩니다.

```bash
docker compose -f deploy/docker-compose.nas.yml exec -T mariadb \
  sh -c 'exec mariadb -uroot -p"$MYSQL_ROOT_PASSWORD" suwon_es_admin' \
  < backend/sql/001_schema.sql
```

컬럼 변경/삭제는 `ALTER TABLE`을 직접 실행해야 합니다.

---

## 문제가 생기면

| 증상 | 원인과 조치 |
|---|---|
| 호스트에서 `docker: 'compose' is not a docker command` | Container Manager 가 compose v2 플러그인을 안 깔아준 것. 2번의 안내대로 설치하거나 `docker-compose`(하이픈)를 쓰세요 |
| Actions `deploy`가 `required variable ... is missing a value`로 실패 | 4번 시크릿 미등록. 워크플로가 먼저 "필수 시크릿 확인" 단계에서 잡아줍니다 |
| Actions가 `Waiting for a runner`에서 멈춤 | 러너가 죽었습니다. `docker compose -f deploy/github-runner-compose.yml restart` |
| 러너가 목록에 안 뜸 | `GH_RUNNER_TOKEN` 만료/권한 부족. classic PAT + `repo` 권한으로 재발급 |
| 화면은 뜨는데 로그인 시 401/500 | `$C logs backend` 확인. DB 비밀번호 불일치가 가장 흔합니다 |
| 화면이 옛날 그대로 | `index.html`은 `no-store`라 보통 하드 리프레시(⌘⇧R)면 됩니다 |
| DB만 초기화하고 싶음 | `$C down && docker volume rm suwon-es_mariadb_data && $C up -d` — **데이터가 전부 사라집니다** |

---

# 외부 공개 (Tailscale Funnel)

## 왜 포트포워딩이 아닌가

이 망은 NAT 가 3겹입니다.

```
인터넷 → [통신사/건물 최상위] → 192.168.30.1 → 192.168.222.1 → 192.20.50.1 → NAS
```

우리 공유기의 WAN 쪽이 이미 사설 IP(`192.168.222.x`)라, 밖에서 오는 요청은 위층에서 막힙니다.
우리 공유기에만 포워딩을 걸어도 요청이 내려오지 못합니다.
`traceroute -n 8.8.8.8` 의 2~3번째 홉이 사설 IP 면 같은 상황입니다.

그래서 **방향을 뒤집습니다.** NAS 가 밖으로 나가 연결을 유지하고, 그 통로로 서비스합니다.
QuickConnect 가 되는 것과 같은 원리입니다 (다만 QuickConnect 는 DSM 과 Synology 패키지만
중계해서 우리 컨테이너에는 쓸 수 없습니다).

## 1. Tailscale 계정 준비

<https://login.tailscale.com/start> 에서 가입 (Google/GitHub 계정으로 가능, 무료).

가입 후 관리 콘솔에서 **세 가지**를 해야 합니다.

**a) MagicDNS + HTTPS 인증서 켜기**
**DNS** 탭 → `MagicDNS` 활성화 → 아래 `HTTPS Certificates` 도 **Enable**

**b) Funnel 권한 열기**
**Access Controls** 탭에서 정책 파일에 `nodeAttrs` 를 추가합니다.

```json
"nodeAttrs": [
  { "target": ["autogroup:member"], "attr": ["funnel"] }
]
```

**c) 인증 키 발급**
**Settings → Keys → Generate auth key**
- Reusable: 켬
- Ephemeral: **끔** (꺼야 재기동 시 노드가 유지됩니다)
- 생성된 `tskey-auth-...` 를 복사

## 2. GitHub 시크릿에 등록

저장소 → **Settings → Secrets and variables → Actions → New repository secret**

| 이름 | 값 |
|---|---|
| `TS_AUTHKEY` | 위에서 복사한 `tskey-auth-...` |

## 3. 배포

main 에 push 하면 터널 컨테이너까지 함께 올라갑니다.

## 4. 공개 주소 확인

```bash
docker exec suwon-es-tailscale-1 tailscale status
```

첫 줄에 `suwon-es.<tailnet>.ts.net` 형태의 이름이 보입니다. 그게 공개 주소입니다.

```bash
docker exec suwon-es-tailscale-1 tailscale funnel status
```

`https://suwon-es.<tailnet>.ts.net (Funnel on)` 과 `|-- / proxy http://frontend:80` 이 보이면 정상입니다.

이제 **어느 망에서든** 그 주소로 접속됩니다. 인증서는 자동이라 경고가 뜨지 않습니다.

## 문제가 생기면

| 증상 | 조치 |
|---|---|
| `tailscale status` 가 `Logged out` | `TS_AUTHKEY` 미등록/만료. 새 키 발급 후 시크릿 갱신, 컨테이너 재생성 |
| `Funnel is not enabled` | 1-b 의 `nodeAttrs` 정책이 빠졌습니다 |
| 인증서 오류 | 1-a 의 HTTPS Certificates 가 꺼져 있습니다 |
| 502 / 연결 안 됨 | `docker exec suwon-es-tailscale-1 wget -qO- http://frontend:80/healthz` 로 내부 도달 확인 |

> **터널은 앱을 인터넷에 그대로 공개합니다.** 앱의 로그인 화면이 유일한 방어선입니다.
> 시드 계정 비밀번호를 반드시 바꾸고 안 쓰는 계정은 지우세요.

---

## 아직 안 된 것

- **학생 출석**: 화면은 있지만 교사 출결 API(`/apps/attendance`)를 그대로 쓰고 있어 교사 명단이 나옵니다. 학생 전용 출석 테이블·API가 필요합니다.
- **HTTPS**: 현재 `http://<NAS_IP>:8080` 평문입니다. 외부에 열려면 DSM 역방향 프록시 + Let's Encrypt를 붙이세요. nginx가 same-origin 구조라 프론트 재빌드 없이 가능합니다.
