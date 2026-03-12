<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import { avatarText } from '@core/utils/formatters'

const userListStore = useUserListStore()
const stats = ref(null)

userListStore.fetchStats().then(response => {
  stats.value = response.data
})

const resolveDeptVariant = dept => {
  if (dept === '교무팀') return { color: 'primary' }
  if (dept === '상담팀') return { color: 'info' }
  if (dept === '초등1반') return { color: 'success' }
  if (dept === '초등2반') return { color: 'warning' }
  if (dept === '초등3반') return { color: 'error' }
  return { color: 'secondary' }
}

const resolveRateColor = rate => {
  if (rate >= 95) return 'success'
  if (rate >= 85) return 'primary'
  if (rate >= 75) return 'warning'
  return 'error'
}
</script>

<template>
  <section v-if="stats">
    <!-- 요약 -->
    <VRow class="mb-6">
      <VCol
        cols="6"
        md="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon icon="mdi-account-group" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-bold">
                {{ stats.total }}명
              </div>
              <div class="text-sm text-medium-emphasis">
                전체 교사
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              color="success"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon icon="mdi-check-circle-outline" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-bold">
                {{ stats.top10.length > 0 ? stats.top10[0].attendanceRate : 0 }}%
              </div>
              <div class="text-sm text-medium-emphasis">
                최고 출석률
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              color="warning"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon icon="mdi-alert-circle-outline" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-bold">
                {{ stats.bottom10.length > 0 ? stats.bottom10[0].attendanceRate : 0 }}%
              </div>
              <div class="text-sm text-medium-emphasis">
                최저 출석률
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              color="info"
              variant="tonal"
              size="48"
              rounded
            >
              <VIcon icon="mdi-chart-line" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-bold">
                {{ Math.round((stats.top10.reduce((s, i) => s + i.attendanceRate, 0) + stats.bottom10.reduce((s, i) => s + i.attendanceRate, 0)) / (stats.top10.length + stats.bottom10.length)) }}%
              </div>
              <div class="text-sm text-medium-emphasis">
                평균 출석률
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- 출석률 상위 10 -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard>
          <VCardItem>
            <template #prepend>
              <VIcon
                icon="mdi-trophy-outline"
                color="success"
              />
            </template>
            <VCardTitle class="text-base">
              출석률 상위 10
            </VCardTitle>
          </VCardItem>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th scope="col">순위</th>
                <th scope="col">교사</th>
                <th
                  scope="col"
                  class="text-center"
                >
                  부서
                </th>
                <th
                  scope="col"
                  class="text-center"
                >
                  출석률
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in stats.top10"
                :key="item.id"
              >
                <td class="font-weight-bold">
                  {{ i + 1 }}
                </td>
                <td>
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="resolveDeptVariant(item.department).color"
                      variant="tonal"
                      size="32"
                    >
                      <VImg
                        v-if="item.avatar"
                        :src="item.avatar"
                      />
                      <span
                        v-else
                        class="text-xs"
                      >{{ avatarText(item.fullName) }}</span>
                    </VAvatar>
                    <span class="text-sm font-weight-medium">{{ item.fullName }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <VChip
                    :color="resolveDeptVariant(item.department).color"
                    size="small"
                  >
                    {{ item.department }}
                  </VChip>
                </td>
                <td class="text-center">
                  <VChip
                    :color="resolveRateColor(item.attendanceRate)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.attendanceRate }}%
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>

      <!-- 출석률 하위 10 -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard>
          <VCardItem>
            <template #prepend>
              <VIcon
                icon="mdi-alert-circle-outline"
                color="warning"
              />
            </template>
            <VCardTitle class="text-base">
              출석률 하위 10
            </VCardTitle>
          </VCardItem>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th scope="col">순위</th>
                <th scope="col">교사</th>
                <th
                  scope="col"
                  class="text-center"
                >
                  부서
                </th>
                <th
                  scope="col"
                  class="text-center"
                >
                  출석률
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in stats.bottom10"
                :key="item.id"
              >
                <td class="font-weight-bold">
                  {{ i + 1 }}
                </td>
                <td>
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="resolveDeptVariant(item.department).color"
                      variant="tonal"
                      size="32"
                    >
                      <VImg
                        v-if="item.avatar"
                        :src="item.avatar"
                      />
                      <span
                        v-else
                        class="text-xs"
                      >{{ avatarText(item.fullName) }}</span>
                    </VAvatar>
                    <span class="text-sm font-weight-medium">{{ item.fullName }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <VChip
                    :color="resolveDeptVariant(item.department).color"
                    size="small"
                  >
                    {{ item.department }}
                  </VChip>
                </td>
                <td class="text-center">
                  <VChip
                    :color="resolveRateColor(item.attendanceRate)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.attendanceRate }}%
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>
  </section>

  <!-- 로딩 -->
  <div
    v-else
    class="text-center py-10"
  >
    <VProgressCircular
      indeterminate
      color="primary"
    />
    <p class="mt-4 text-medium-emphasis">
      출석 데이터를 불러오는 중...
    </p>
  </div>
</template>
