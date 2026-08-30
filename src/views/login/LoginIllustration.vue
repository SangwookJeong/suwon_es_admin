<!--
  로그인 화면 일러스트 (수원교회 초등부).
  직접 그린 SVG 라 용량이 작고(수 KB) 어떤 해상도에서도 선명합니다.
  색상은 CSS 변수로 빼서 라이트/다크 테마에 각각 대응합니다.
-->
<template>
  <svg
    class="login-illustration"
    viewBox="0 0 640 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="교회와 아이들 일러스트"
  >
    <!-- 배경 원 -->
    <circle
      cx="320"
      cy="240"
      r="198"
      fill="var(--ill-halo)"
    />

    <!-- 해 -->
    <g>
      <circle
        cx="122"
        cy="104"
        r="30"
        fill="#FFD86B"
      />
      <circle
        cx="122"
        cy="104"
        r="40"
        fill="#FFD86B"
        opacity="0.25"
      />
    </g>

    <!-- 구름 -->
    <g fill="var(--ill-cloud)">
      <g opacity="0.95">
        <circle
          cx="206"
          cy="128"
          r="17"
        />
        <circle
          cx="230"
          cy="120"
          r="23"
        />
        <circle
          cx="256"
          cy="128"
          r="15"
        />
        <rect
          x="206"
          y="126"
          width="50"
          height="18"
          rx="9"
        />
      </g>
      <g opacity="0.75">
        <circle
          cx="452"
          cy="118"
          r="14"
        />
        <circle
          cx="472"
          cy="112"
          r="19"
        />
        <rect
          x="452"
          y="114"
          width="36"
          height="16"
          rx="8"
        />
      </g>
    </g>

    <!-- 풍선 (오른쪽 아이가 들고 있음) -->
    <g>
      <path
        d="M494 204q-4 70 0 136"
        stroke="var(--ill-line)"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M528 236q-20 56 -33 104"
        stroke="var(--ill-line)"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
        opacity="0.45"
      />
      <ellipse
        cx="494"
        cy="182"
        rx="18"
        ry="22"
        fill="#FFB4C2"
      />
      <path
        d="M490 203h8l-4 6-4-6Z"
        fill="#FFB4C2"
      />
      <ellipse
        cx="487"
        cy="175"
        rx="5"
        ry="7"
        fill="#fff"
        opacity="0.5"
      />
      <ellipse
        cx="528"
        cy="218"
        rx="15"
        ry="18"
        fill="#FFE7A3"
      />
      <path
        d="M525 235h6l-3 5-3-5Z"
        fill="#FFE7A3"
      />
      <ellipse
        cx="523"
        cy="212"
        rx="4"
        ry="6"
        fill="#fff"
        opacity="0.5"
      />
    </g>

    <!-- 작은 새 -->
    <g
      stroke="var(--ill-line)"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.6"
    >
      <path d="M150 214q11-11 22 0" />
      <path d="M172 214q11-11 22 0" />
    </g>

    <!-- 언덕 -->
    <path
      d="M62 406c62-36 132-48 200-48s154 14 214 48c22 12 12 30-12 30H82c-26 0-38-18-20-30Z"
      fill="var(--ill-ground)"
    />

    <!-- 들꽃 -->
    <g>
      <g transform="translate(148 392)">
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="#FFB4C2"
        />
        <circle
          cx="-6"
          cy="0"
          r="4"
          fill="#FFB4C2"
        />
        <circle
          cx="6"
          cy="0"
          r="4"
          fill="#FFB4C2"
        />
        <circle
          cx="0"
          cy="-6"
          r="4"
          fill="#FFB4C2"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="#FFE7A3"
        />
      </g>
      <g transform="translate(492 398)">
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="#FFF"
          opacity="0.9"
        />
        <circle
          cx="-6"
          cy="0"
          r="4"
          fill="#FFF"
          opacity="0.9"
        />
        <circle
          cx="6"
          cy="0"
          r="4"
          fill="#FFF"
          opacity="0.9"
        />
        <circle
          cx="0"
          cy="-6"
          r="4"
          fill="#FFF"
          opacity="0.9"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="#FFD86B"
        />
      </g>
    </g>

    <!-- ── 교회 ── -->
    <g>
      <!-- 십자가 -->
      <rect
        x="315"
        y="52"
        width="10"
        height="38"
        rx="5"
        fill="var(--ill-roof)"
      />
      <rect
        x="303"
        y="65"
        width="34"
        height="10"
        rx="5"
        fill="var(--ill-roof)"
      />

      <!-- 첨탑 지붕 (모서리를 둥글게) -->
      <path
        d="M320 92c3 0 5 1 6 3l22 32c2 4 0 8-5 8h-46c-5 0-7-4-5-8l22-32c1-2 3-3 6-3Z"
        fill="var(--ill-roof)"
      />
      <rect
        x="302"
        y="133"
        width="36"
        height="54"
        rx="10"
        fill="var(--ill-body)"
        stroke="var(--ill-line)"
        stroke-width="3"
      />
      <circle
        cx="320"
        cy="156"
        r="9"
        fill="var(--ill-window)"
        stroke="var(--ill-line)"
        stroke-width="2.5"
      />

      <!-- 본 지붕 -->
      <path
        d="M320 172c4 0 8 2 11 5l102 56c6 4 4 11-4 11H211c-8 0-10-7-4-11l102-56c3-3 7-5 11-5Z"
        fill="var(--ill-roof)"
      />

      <!-- 본체 -->
      <rect
        x="228"
        y="240"
        width="184"
        height="140"
        rx="18"
        fill="var(--ill-body)"
        stroke="var(--ill-line)"
        stroke-width="3"
      />

      <!-- 하트 창 -->
      <path
        d="M320 292c-11-8-20-14-20-23a10 10 0 0 1 20-4 10 10 0 0 1 20 4c0 9-9 15-20 23Z"
        fill="#FFB4C2"
        stroke="var(--ill-line)"
        stroke-width="2.5"
        stroke-linejoin="round"
      />

      <!-- 양옆 창 -->
      <path
        d="M254 320a12 12 0 0 1 24 0v26a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6v-26Z"
        fill="var(--ill-window)"
        stroke="var(--ill-line)"
        stroke-width="2.5"
      />
      <path
        d="M362 320a12 12 0 0 1 24 0v26a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6v-26Z"
        fill="var(--ill-window)"
        stroke="var(--ill-line)"
        stroke-width="2.5"
      />

      <!-- 문 -->
      <path
        d="M300 316a20 20 0 0 1 40 0v64h-40v-64Z"
        fill="#FFD3B6"
        stroke="var(--ill-line)"
        stroke-width="2.5"
      />
      <circle
        cx="332"
        cy="352"
        r="3"
        fill="var(--ill-line)"
      />
    </g>

    <!-- ── 아이들 (치비 비율) ── -->
    <!-- 왼쪽 아이 (성경책을 든) -->
    <g>
      <rect
        x="174"
        y="400"
        width="11"
        height="17"
        rx="5.5"
        fill="#F6C89A"
      />
      <rect
        x="188"
        y="400"
        width="11"
        height="17"
        rx="5.5"
        fill="#F6C89A"
      />
      <rect
        x="170"
        y="412"
        width="17"
        height="10"
        rx="5"
        fill="#5B6C8F"
      />
      <rect
        x="186"
        y="412"
        width="17"
        height="10"
        rx="5"
        fill="#5B6C8F"
      />
      <rect
        x="154"
        y="372"
        width="13"
        height="25"
        rx="6.5"
        fill="#FFB4C2"
      />
      <rect
        x="205"
        y="372"
        width="13"
        height="25"
        rx="6.5"
        fill="#FFB4C2"
      />
      <rect
        x="167"
        y="366"
        width="38"
        height="38"
        rx="16"
        fill="#FFB4C2"
      />
      <rect
        x="170"
        y="382"
        width="32"
        height="21"
        rx="3"
        fill="#FFF8EC"
        stroke="var(--ill-line)"
        stroke-width="2.4"
      />
      <path
        d="M186 382v21"
        stroke="var(--ill-line)"
        stroke-width="2.4"
      />
      <circle
        cx="167"
        cy="393"
        r="6"
        fill="#F6C89A"
      />
      <circle
        cx="205"
        cy="393"
        r="6"
        fill="#F6C89A"
      />
      <circle
        cx="186"
        cy="336"
        r="27"
        fill="#F6C89A"
      />
      <path
        d="M159 334a27 27 0 0 1 54 0c0 4-3 5-5 3-3-9-12-14-22-14s-19 5-22 14c-2 2-5 1-5-3Z"
        fill="#7B5636"
      />
      <ellipse
        cx="171"
        cy="344"
        rx="5"
        ry="3.2"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <ellipse
        cx="201"
        cy="344"
        rx="5"
        ry="3.2"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <circle
        cx="177"
        cy="336"
        r="4.2"
        fill="#3A2A2A"
      />
      <circle
        cx="195"
        cy="336"
        r="4.2"
        fill="#3A2A2A"
      />
      <circle
        cx="178.6"
        cy="334.4"
        r="1.5"
        fill="#fff"
      />
      <circle
        cx="196.6"
        cy="334.4"
        r="1.5"
        fill="#fff"
      />
      <path
        d="M181 347q5 5 10 0"
        stroke="#3A2A2A"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </g>

    <!-- 문 앞의 작은 아이 (손 흔드는) -->
    <g>
      <rect
        x="311"
        y="404"
        width="10"
        height="15"
        rx="5"
        fill="#F3BE8E"
      />
      <rect
        x="322"
        y="404"
        width="10"
        height="15"
        rx="5"
        fill="#F3BE8E"
      />
      <rect
        x="307"
        y="414"
        width="15"
        height="9"
        rx="4.5"
        fill="#5B6C8F"
      />
      <rect
        x="321"
        y="414"
        width="15"
        height="9"
        rx="4.5"
        fill="#5B6C8F"
      />
      <rect
        x="294"
        y="380"
        width="11"
        height="21"
        rx="5.5"
        fill="#FFE7A3"
      />
      <circle
        cx="299.5"
        cy="402"
        r="5.5"
        fill="#F3BE8E"
      />
      <path
        d="M337 380l12-16a5.5 5.5 0 0 1 8 6l-11 16-9-6Z"
        fill="#FFE7A3"
      />
      <circle
        cx="354"
        cy="361"
        r="6"
        fill="#F3BE8E"
      />
      <rect
        x="303"
        y="374"
        width="34"
        height="33"
        rx="14"
        fill="#FFE7A3"
      />
      <circle
        cx="320"
        cy="352"
        r="21"
        fill="#F3BE8E"
      />
      <path
        d="M299 350a21 21 0 0 1 42 0c0 3-3 4-4 2-3-7-10-11-17-11s-14 4-17 11c-1 2-4 1-4-2Z"
        fill="#3E2C1D"
      />
      <ellipse
        cx="308"
        cy="358"
        rx="4.2"
        ry="2.7"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <ellipse
        cx="332"
        cy="358"
        rx="4.2"
        ry="2.7"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <circle
        cx="313"
        cy="352"
        r="3.6"
        fill="#2A1D14"
      />
      <circle
        cx="327"
        cy="352"
        r="3.6"
        fill="#2A1D14"
      />
      <circle
        cx="314.3"
        cy="350.7"
        r="1.3"
        fill="#fff"
      />
      <circle
        cx="328.3"
        cy="350.7"
        r="1.3"
        fill="#fff"
      />
      <path
        d="M316 361q4 4 8 0"
        stroke="#2A1D14"
        stroke-width="2"
        stroke-linecap="round"
      />
    </g>

    <!-- 오른쪽 아이 (풍선을 든) -->
    <g>
      <rect
        x="436"
        y="400"
        width="11"
        height="17"
        rx="5.5"
        fill="#EEB98A"
      />
      <rect
        x="450"
        y="400"
        width="11"
        height="17"
        rx="5.5"
        fill="#EEB98A"
      />
      <rect
        x="432"
        y="412"
        width="17"
        height="10"
        rx="5"
        fill="#5B6C8F"
      />
      <rect
        x="448"
        y="412"
        width="17"
        height="10"
        rx="5"
        fill="#5B6C8F"
      />
      <rect
        x="417"
        y="372"
        width="13"
        height="25"
        rx="6.5"
        fill="#A8E6CF"
      />
      <circle
        cx="423.5"
        cy="398"
        r="6"
        fill="#EEB98A"
      />
      <path
        d="M464 372l20-24a6 6 0 0 1 9 8l-19 23-10-7Z"
        fill="#A8E6CF"
      />
      <circle
        cx="494"
        cy="342"
        r="6.5"
        fill="#EEB98A"
      />
      <rect
        x="430"
        y="366"
        width="37"
        height="38"
        rx="16"
        fill="#A8E6CF"
      />
      <circle
        cx="448"
        cy="338"
        r="26"
        fill="#EEB98A"
      />
      <path
        d="M422 336a26 26 0 0 1 52 0c0 4-3 5-5 3-3-9-12-13-21-13s-18 4-21 13c-2 2-5 1-5-3Z"
        fill="#6B4A2F"
      />
      <circle
        cx="424"
        cy="340"
        r="8"
        fill="#6B4A2F"
      />
      <circle
        cx="472"
        cy="340"
        r="8"
        fill="#6B4A2F"
      />
      <ellipse
        cx="434"
        cy="346"
        rx="5"
        ry="3.2"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <ellipse
        cx="462"
        cy="346"
        rx="5"
        ry="3.2"
        fill="#FF9AAE"
        opacity="0.55"
      />
      <circle
        cx="440"
        cy="338"
        r="4.2"
        fill="#3A2A2A"
      />
      <circle
        cx="456"
        cy="338"
        r="4.2"
        fill="#3A2A2A"
      />
      <circle
        cx="441.6"
        cy="336.4"
        r="1.5"
        fill="#fff"
      />
      <circle
        cx="457.6"
        cy="336.4"
        r="1.5"
        fill="#fff"
      />
      <path
        d="M443 349q5 5 10 0"
        stroke="#3A2A2A"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </g>

    <!-- 나비 -->
    <g transform="translate(146 300)">
      <path
        d="M0 0c-8-9-16-9-16-2s8 9 16 2Z"
        fill="#D5C8F0"
      />
      <path
        d="M0 0c8-9 16-9 16-2s-8 9-16 2Z"
        fill="#D5C8F0"
      />
      <rect
        x="-1.5"
        y="-6"
        width="3"
        height="14"
        rx="1.5"
        fill="var(--ill-line)"
        opacity="0.7"
      />
    </g>

    <!-- 반짝이 -->
    <g fill="#FFD86B">
      <path d="M168 268l4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11Z" />
      <path
        d="M486 168l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z"
        opacity="0.85"
      />
      <path
        d="M136 348l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5 2.5-7Z"
        opacity="0.7"
      />
    </g>
  </svg>
</template>

<style lang="scss" scoped>
.login-illustration {
  /* 라이트 테마 */
  --ill-halo: #eaf2fc;
  --ill-cloud: #ffffff;
  --ill-ground: #cdeccd;
  --ill-body: #fff8ec;
  --ill-roof: #003678;
  --ill-line: #003678;
  --ill-window: #cfe4f7;

  inline-size: 100%;
  max-inline-size: 680px;
  block-size: auto;
}

/* 다크 테마에서는 남색이 배경에 묻히므로 밝은 톤으로 바꿉니다. */
.v-theme--dark .login-illustration {
  --ill-halo: #1c2b45;
  --ill-cloud: #3b4f72;
  --ill-ground: #33543c;
  --ill-body: #24334a;
  --ill-roof: #7fa9e0;
  --ill-line: #9cc0ea;
  --ill-window: #40699c;
}
</style>
