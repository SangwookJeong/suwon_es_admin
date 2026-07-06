<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const userListStore = useUserListStore()

const resolveDeptVariant = dept => {
  if (dept === '교무팀') return { color: 'primary' }
  if (dept === '상담팀') return { color: 'info' }
  if (dept === '초등1반') return { color: 'success' }
  if (dept === '초등2반') return { color: 'warning' }
  if (dept === '초등3반') return { color: 'error' }

  return { color: 'secondary' }
}

const currentYear = new Date().getFullYear()

const sortedHistory = computed(() =>
  [...(props.userData.serviceHistory ?? [])].sort((a, b) => b.year - a.year),
)

// 연도별 출석 통계
const yearlyStats = ref({})

userListStore.fetchUserYearlyStats(props.userData.id).then(response => {
  yearlyStats.value = response.data.yearlyStats
})

const getYearRate = year => {
  const s = yearlyStats.value[year]
  if (!s) return null

  return s
}

const rateColor = rate => {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
}
</script>

<template>
  <VCard>
    <VCardText>
      <h6 class="text-h6">
        연도별 봉사현황
      </h6>
      <VDivider class="mt-4 mb-4" />
    </VCardText>
    <VTable class="text-no-wrap history-table">
      <thead>
        <tr>
          <th
            scope="col"
            class="text-center"
          >
            연도
          </th>
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
            직분
          </th>
          <th
            scope="col"
            class="text-center"
          >
            담당
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
          v-for="item in sortedHistory"
          :key="item.year"
        >
          <td class="text-center font-weight-medium">
            {{ item.year }}
            <VChip
              v-if="item.year === currentYear"
              color="primary"
              size="x-small"
              class="ms-2"
            >
              현재
            </VChip>
          </td>
          <td class="text-center">
            <VChip
              :color="resolveDeptVariant(item.department).color"
              size="small"
            >
              {{ item.department }}
            </VChip>
          </td>
          <td class="text-center text-medium-emphasis">
            {{ item.position || '-' }}
          </td>
          <td class="text-center text-medium-emphasis">
            {{ item.assignedClass || '-' }}
          </td>
          <td class="text-center">
            <template v-if="getYearRate(item.year)">
              <div class="d-inline-flex align-center gap-2">
                <VProgressLinear
                  :model-value="getYearRate(item.year).rate"
                  :color="rateColor(getYearRate(item.year).rate)"
                  height="6"
                  rounded
                  style="min-inline-size: 60px;"
                />
                <span class="text-sm font-weight-medium" :class="`text-${rateColor(getYearRate(item.year).rate)}`">
                  {{ getYearRate(item.year).rate }}%
                </span>
                <span class="text-xs text-medium-emphasis">
                  ({{ getYearRate(item.year).present }}/{{ getYearRate(item.year).total }})
                </span>
              </div>
            </template>
            <span
              v-else
              class="text-disabled"
            >-</span>
          </td>
        </tr>
      </tbody>

      <tfoot v-show="!sortedHistory.length">
        <tr>
          <td
            colspan="5"
            class="text-center"
          >
            봉사 이력이 없습니다
          </td>
        </tr>
      </tfoot>
    </VTable>
  </VCard>
</template>

<style lang="scss">
.history-table {
  th, td {
    &:first-child {
      padding-inline-start: 1.5rem !important;
    }

    &:last-child {
      padding-inline-end: 1.5rem !important;
    }
  }
}
</style>
