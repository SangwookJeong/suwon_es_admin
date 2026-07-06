<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import { avatarText } from '@core/utils/formatters'

const userListStore = useUserListStore()

// 로그인 사용자 권한
const myTeacher = ref(null)
const userData = JSON.parse(localStorage.getItem('userData') || '{}')

if (userData.teacherId) {
  userListStore.fetchUser(userData.teacherId).then(response => {
    myTeacher.value = response.data
  }).catch(() => {})
}

const canEdit = computed(() => {
  const t = myTeacher.value
  if (!t) return () => false

  // 교무팀 → 전체 체크 가능
  if (t.department === '교무팀')
    return () => true

  // 상담팀장 → 상담팀만
  if (t.position === '상담팀장')
    return record => record.department === '상담팀'

  // 반장, 형제부반장, 자매부반장 → 자기 부서만
  if (['반장', '형제부반장', '자매부반장'].includes(t.position))
    return record => record.department === t.department

  return () => false
})

// 다음 일요일 계산
const getNextSunday = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const sunday = new Date(today)

  sunday.setDate(today.getDate() + diff)

  const y = sunday.getFullYear()
  const m = String(sunday.getMonth() + 1).padStart(2, '0')
  const d = String(sunday.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

const getToday = () => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

const tabs = [
  { title: '주일오전', value: '주일오전' },
  { title: '주일오후', value: '주일오후' },
  { title: '교사교육', value: '교사교육' },
]

// 몇월 몇주차 계산
const getWeekOfMonth = dateStr => {
  const [y, m, d] = dateStr.split('-').map(Number)

  return `${m}월 ${Math.ceil(d / 7)}주차`
}

const getMonthLabel = dateStr => {
  const m = Number(dateStr.split('-')[1])

  return `${m}월`
}

const currentTab = ref('주일오전')
const selectedDate = ref(getNextSunday())
const searchQuery = ref('')
const loading = ref(false)
const records = ref([])
const totalCount = ref(0)
const presentCount = ref(0)
const absentCount = ref(0)
const rate = ref(0)
const deptStats = ref({})
const snackbar = ref(false)
const snackbarMessage = ref('')

// 카테고리별 통계 (상단 요약용)
const allCategoryStats = ref({
  '주일오전': { total: 0, present: 0, absent: 0, rate: 0 },
  '주일오후': { total: 0, present: 0, absent: 0, rate: 0 },
  '교사교육': { total: 0, present: 0, absent: 0, rate: 0 },
})

const categoryMeta = computed(() => [
  { value: '주일오전', icon: 'mdi-weather-sunny', color: 'primary', label: getWeekOfMonth(getNextSunday()) },
  { value: '주일오후', icon: 'mdi-weather-sunset', color: 'success', label: getWeekOfMonth(getNextSunday()) },
  { value: '교사교육', icon: 'mdi-school-outline', color: 'info', label: getMonthLabel(getToday()) },
])

const deptOrder = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']

const deptColorMap = {
  '교무팀': 'primary',
  '상담팀': 'info',
  '초등1반': 'success',
  '초등2반': 'warning',
  '초등3반': 'error',
}

// 월별 부서 평균 출석 통계
const monthlyDeptStats = ref({})
const monthlyStatsDays = ref(0)

const getMonthFromDate = dateStr => dateStr.substring(0, 7)

const fetchMonthlyDeptStats = () => {
  const month = getMonthFromDate(selectedDate.value)

  userListStore.fetchMonthlyDeptStats({
    month,
    type: currentTab.value,
  }).then(response => {
    monthlyDeptStats.value = response.data.deptMonthlyStats
    monthlyStatsDays.value = response.data.days
  })
}

const getMonthlyDeptRate = dept => {
  const s = monthlyDeptStats.value[dept]
  if (!s) return 0

  return s.rate
}

// 전체 카테고리 통계 조회
const fetchAllCategoryStats = () => {
  const sundayDate = getNextSunday()
  const todayDate = getToday()

  const fetches = [
    { type: '주일오전', date: sundayDate },
    { type: '주일오후', date: sundayDate },
    { type: '교사교육', date: todayDate },
  ]

  fetches.forEach(({ type, date }) => {
    userListStore.fetchAttendance({ date, type }).then(response => {
      const data = response.data

      allCategoryStats.value[type] = {
        total: data.total,
        present: data.presentCount,
        absent: data.absentCount,
        rate: data.rate,
      }
    })
  })
}

fetchAllCategoryStats()

// 탭 변경 시 날짜 자동 설정
watch(currentTab, val => {
  if (val === '교사교육') {
    selectedDate.value = getToday()
  } else {
    selectedDate.value = getNextSunday()
  }
})

const fetchData = () => {
  loading.value = true
  userListStore.fetchAttendance({
    date: selectedDate.value,
    type: currentTab.value,
  }).then(response => {
    const data = response.data

    records.value = data.records
    totalCount.value = data.total
    presentCount.value = data.presentCount
    absentCount.value = data.absentCount
    rate.value = data.rate
    deptStats.value = data.deptStats
  }).finally(() => {
    loading.value = false
  })
}

// 날짜 또는 탭 변경 시 데이터 재조회
watch([selectedDate, currentTab], () => {
  fetchData()
  fetchMonthlyDeptStats()
}, { immediate: true })

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value

  const q = searchQuery.value.toLowerCase()

  return records.value.filter(r =>
    r.fullName.toLowerCase().includes(q) ||
    (r.contact && r.contact.includes(q)),
  )
})

const toggleAttendance = id => {
  const rec = records.value.find(r => r.id === id)
  if (rec && canEdit.value(rec)) {
    rec.present = !rec.present
    recalcStats()
  }
}

const markAllPresent = () => {
  records.value.forEach(r => { if (canEdit.value(r)) r.present = true })
  recalcStats()
}

const clearAll = () => {
  records.value.forEach(r => { if (canEdit.value(r)) r.present = false })
  recalcStats()
}

const recalcStats = () => {
  presentCount.value = records.value.filter(r => r.present).length
  absentCount.value = totalCount.value - presentCount.value
  rate.value = totalCount.value > 0 ? Math.round(presentCount.value / totalCount.value * 100) : 0

  // 부서별 재계산
  deptOrder.forEach(dept => {
    const deptUsers = records.value.filter(r => r.department === dept)

    deptStats.value[dept] = {
      total: deptUsers.length,
      present: deptUsers.filter(r => r.present).length,
    }
  })

  // 상단 카테고리별 통계도 현재 탭 반영
  allCategoryStats.value[currentTab.value] = {
    total: totalCount.value,
    present: presentCount.value,
    absent: absentCount.value,
    rate: rate.value,
  }
}

const saveAttendance = () => {
  const presentIds = records.value.filter(r => r.present).map(r => r.id)

  userListStore.saveAttendance({
    date: selectedDate.value,
    type: currentTab.value,
    presentIds,
  }).then(() => {
    snackbarMessage.value = '출석 정보가 저장되었습니다.'
    snackbar.value = true
    fetchAllCategoryStats()
    fetchMonthlyDeptStats()
  })
}

const getDeptRate = dept => {
  const s = deptStats.value[dept]
  if (!s || s.total === 0) return 0

  return Math.round(s.present / s.total * 100)
}

const formatDateDisplay = date => {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  const days = ['일', '월', '화', '수', '목', '금', '토']

  return `${y}-${m}-${d} (${days[dt.getDay()]})`
}

const resolveBsLabel = bs => {
  if (bs === '형제') return '형제'
  if (bs === '자매') return '자매'

  return bs || ''
}
</script>

<template>
  <section>
    <!-- 날짜 선택 + 카테고리 탭 -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <VTextField
          v-model="selectedDate"
          type="date"
          label="날짜 선택"
          density="compact"
          style="max-inline-size: 220px;"
          hide-details
        />

        <VSpacer />

        <VBtnToggle
          v-model="currentTab"
          mandatory
          color="primary"
          density="compact"
        >
          <VBtn
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            variant="outlined"
          >
            {{ tab.title }}
          </VBtn>
        </VBtnToggle>
      </VCardText>
    </VCard>

    <!-- 카테고리별 통계 카드 -->
    <VRow class="mb-6">
      <VCol
        v-for="cat in categoryMeta"
        :key="cat.value"
        cols="12"
        md="4"
      >
        <VCard
          :class="{ 'border-primary border-opacity-100': currentTab === cat.value }"
          class="cursor-pointer"
          @click="currentTab = cat.value"
        >
          <VCardText class="pa-5">
            <div class="d-flex align-center gap-2 mb-4">
              <VAvatar
                :color="cat.color"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon :icon="cat.icon" />
              </VAvatar>
              <span class="text-h6 font-weight-medium">{{ cat.value }}</span>
              <VSpacer />
              <span class="text-body-2 text-medium-emphasis">{{ cat.label }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <div class="text-center flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  전체
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ allCategoryStats[cat.value].total }}명
                </div>
              </div>
              <VDivider vertical />
              <div class="text-center flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  출석
                </div>
                <div class="text-h6 font-weight-bold text-success">
                  {{ allCategoryStats[cat.value].present }}명
                </div>
              </div>
              <VDivider vertical />
              <div class="text-center flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  결석
                </div>
                <div class="text-h6 font-weight-bold text-error">
                  {{ allCategoryStats[cat.value].absent }}명
                </div>
              </div>
              <VDivider vertical />
              <div class="text-center flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  출석률
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ allCategoryStats[cat.value].rate }}%
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 부서별 출석 현황 (월 평균) -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex align-center gap-2 mb-4">
          <h3 class="text-h6">
            부서별 출석 현황
          </h3>
          <VChip
            size="small"
            color="secondary"
            variant="tonal"
          >
            {{ getMonthFromDate(selectedDate) }} 월평균
            <span v-if="monthlyStatsDays > 0"> · {{ monthlyStatsDays }}회 기준</span>
          </VChip>
        </div>
        <div class="d-flex flex-wrap gap-x-8 gap-y-3">
          <div
            v-for="dept in deptOrder"
            :key="dept"
            style="min-inline-size: 180px; flex: 1;"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="text-body-2 font-weight-medium">{{ dept }}</span>
              <span class="text-body-2 text-medium-emphasis">
                평균 {{ monthlyDeptStats[dept]?.presentAvg || 0 }}/{{ monthlyDeptStats[dept]?.total || 0 }}명 ({{ getMonthlyDeptRate(dept) }}%)
              </span>
            </div>
            <VProgressLinear
              :model-value="getMonthlyDeptRate(dept)"
              :color="deptColorMap[dept] || 'secondary'"
              height="6"
              rounded
            />
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- 출결 체크 -->
    <VCard>
      <VCardText>
        <div class="d-flex align-center flex-wrap gap-4 mb-4">
          <h3 class="text-h6">
            출결 체크
          </h3>
          <span class="text-body-2 text-medium-emphasis">
            {{ formatDateDisplay(selectedDate) }} / {{ currentTab }}
          </span>

          <VSpacer />

          <VTextField
            v-model="searchQuery"
            placeholder="이름, 연락처 검색"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            style="max-inline-size: 220px;"
            hide-details
            clearable
          />

          <VBtn
            color="success"
            variant="outlined"
            size="small"
            @click="markAllPresent"
          >
            전체출석
          </VBtn>
          <VBtn
            color="warning"
            variant="outlined"
            size="small"
            @click="clearAll"
          >
            전체해제
          </VBtn>
          <VBtn
            color="primary"
            @click="saveAttendance"
          >
            <VIcon
              start
              icon="mdi-content-save"
            />
            저장
          </VBtn>
        </div>

        <VDivider class="mb-2" />

        <!-- 로딩 -->
        <div
          v-if="loading"
          class="text-center py-10"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>

        <VTable
          v-else
          class="text-no-wrap attendance-table"
        >
          <thead>
            <tr>
              <th
                scope="col"
                style="width: 48px;"
              >
                출석
              </th>
              <th scope="col">
                교사
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
                연락처
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in filteredRecords"
              :key="record.id"
              :class="canEdit(record) ? 'cursor-pointer' : 'text-disabled'"
              @click="toggleAttendance(record.id)"
            >
              <td @click.stop>
                <VCheckbox
                  :model-value="record.present"
                  :disabled="!canEdit(record)"
                  hide-details
                  @update:model-value="toggleAttendance(record.id)"
                />
              </td>
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    :color="deptColorMap[record.department] || 'secondary'"
                    variant="tonal"
                    class="me-3"
                    size="34"
                  >
                    <VImg
                      v-if="record.avatar"
                      :src="record.avatar"
                    />
                    <span v-else>{{ avatarText(record.fullName) }}</span>
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <span class="text-sm font-weight-medium text-high-emphasis">
                      {{ record.fullName }}
                    </span>
                    <span class="text-xs text-medium-emphasis">
                      {{ resolveBsLabel(record.bs) }}<span v-if="record.bs && record.serviceGroup"> · </span>{{ record.serviceGroup }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <VChip
                  :color="deptColorMap[record.department] || 'secondary'"
                  size="small"
                >
                  {{ record.department }}
                </VChip>
              </td>
              <td class="text-center text-medium-emphasis">
                {{ record.contact }}
              </td>
            </tr>
          </tbody>
          <tfoot v-show="!filteredRecords.length">
            <tr>
              <td
                colspan="4"
                class="text-center"
              >
                검색 결과가 없습니다.
              </td>
            </tr>
          </tfoot>
        </VTable>

      </VCardText>
    </VCard>

    <!-- 저장 알림 -->
    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="2000"
      location="top"
    >
      {{ snackbarMessage }}
    </VSnackbar>
  </section>
</template>

<style lang="scss">
.attendance-table {
  th, td {
    &:first-child {
      padding-inline-start: 1.5rem !important;
    }

    &:last-child {
      padding-inline-end: 1.5rem !important;
    }
  }

  tbody tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.04);
    }
  }
}
</style>
