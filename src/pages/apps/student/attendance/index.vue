<script setup>
// ℹ️ 학생관리 기능이 준비되기 전까지 교사출석 화면을 임시로 복사해 사용 중입니다.
import AttendanceStatsRow from '@/views/apps/student/AttendanceStatsRow.vue'
import { useStudentListStore } from '@/views/apps/student/useStudentListStore'
import { avatarText } from '@core/utils/formatters'

const studentListStore = useStudentListStore()

// 개인 출석 통계 팝업
const isStatsDialogVisible = ref(false)
const selectedRecord = ref(null)

const openStatsDialog = record => {
  selectedRecord.value = record
  isStatsDialogVisible.value = true
}

// 로그인 사용자 권한
const myTeacher = ref(null)
const userData = JSON.parse(localStorage.getItem('userData') || '{}')

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

// 👉 교무팀은 전체 부서, 그 외(초등1~3반 등)는 본인 부서만 보임
const visibleDept = computed(() => {
  const t = myTeacher.value
  if (!t || t.department === '교무팀') return null

  return t.department
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

// 몇월 몇주차 계산
const getWeekOfMonth = dateStr => {
  const [y, m, d] = dateStr.split('-').map(Number)

  return `${m}월 ${Math.ceil(d / 7)}주차`
}

// ℹ️ 학생 출석은 카테고리 구분 없이 '주일오전' 한 가지 경우만 사용합니다.
const currentTab = '주일오전'
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

// 출석 통계 (상단 요약용)
const summaryStats = ref({ total: 0, present: 0, absent: 0, rate: 0 })
const summaryLabel = computed(() => getWeekOfMonth(selectedDate.value))

const deptOrder = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']

const visibleDeptOrder = computed(() => visibleDept.value ? [visibleDept.value] : deptOrder)

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

  studentListStore.fetchMonthlyDeptStats({
    month,
    type: currentTab,
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

// 상단 요약 통계 조회
const fetchSummaryStats = () => {
  studentListStore.fetchAttendance({ date: selectedDate.value, type: currentTab }).then(response => {
    const scoped = visibleDept.value
      ? response.data.records.filter(r => r.department === visibleDept.value)
      : response.data.records

    const total = scoped.length
    const present = scoped.filter(r => r.present).length

    summaryStats.value = {
      total,
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  })
}

const fetchData = () => {
  loading.value = true
  studentListStore.fetchAttendance({
    date: selectedDate.value,
    type: currentTab,
  }).then(response => {
    records.value = visibleDept.value
      ? response.data.records.filter(r => r.department === visibleDept.value)
      : response.data.records
    totalCount.value = records.value.length
    recalcStats()
  }).finally(() => {
    loading.value = false
  })
}

// 날짜 변경 시 데이터 재조회
watch(selectedDate, () => {
  fetchData()
  fetchMonthlyDeptStats()
})

// 로그인한 교사 정보가 확인된 뒤(본인 부서 범위가 정해진 뒤) 최초 데이터 조회
const initialize = () => {
  fetchSummaryStats()
  fetchMonthlyDeptStats()
  fetchData()
}

if (userData.teacherId) {
  studentListStore.fetchUser(userData.teacherId).then(response => {
    myTeacher.value = response.data
  }).catch(() => {}).finally(initialize)
} else {
  initialize()
}

// 다중 선택 필터 (부서/소속/B·S)
const selectedFilterDept = ref([])
const selectedFilterServiceGroup = ref([])
const selectedFilterBs = ref([])

const serviceGroupFilterOptions = ['봉사회', '어머니회', '청년회']

const bsFilterOptions = [
  { title: '형제 (B)', value: 'B' },
  { title: '자매 (S)', value: 'S' },
]

const departmentFilterOptions = computed(() => visibleDeptOrder.value.map(dept => ({ title: dept, value: dept })))

const filteredRecords = computed(() => {
  let list = records.value

  if (selectedFilterDept.value.length)
    list = list.filter(r => selectedFilterDept.value.includes(r.department))

  if (selectedFilterServiceGroup.value.length)
    list = list.filter(r => selectedFilterServiceGroup.value.includes(r.serviceGroup))

  if (selectedFilterBs.value.length)
    list = list.filter(r => selectedFilterBs.value.includes(r.bs))

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()

    list = list.filter(r =>
      r.fullName.toLowerCase().includes(q) ||
      (r.contact && r.contact.includes(q)),
    )
  }

  return list
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
  visibleDeptOrder.value.forEach(dept => {
    const deptUsers = records.value.filter(r => r.department === dept)

    deptStats.value[dept] = {
      total: deptUsers.length,
      present: deptUsers.filter(r => r.present).length,
    }
  })

  // 상단 요약 통계도 반영
  summaryStats.value = {
    total: totalCount.value,
    present: presentCount.value,
    absent: absentCount.value,
    rate: rate.value,
  }
}

const saveAttendance = () => {
  const presentIds = records.value.filter(r => r.present).map(r => r.id)

  studentListStore.saveAttendance({
    date: selectedDate.value,
    type: currentTab,
    presentIds,
  }).then(() => {
    snackbarMessage.value = '출석 정보가 저장되었습니다.'
    snackbar.value = true
    fetchSummaryStats()
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
  if (bs === 'B') return '형제'
  if (bs === 'S') return '자매'

  return bs || ''
}

// 👉 소속별 색상
const resolveGroupVariant = group => {
  if (group === '봉사회') return 'primary'
  if (group === '어머니회') return 'info'
  if (group === '청년회') return 'success'

  return 'secondary'
}
</script>

<template>
  <section>
    <!-- 날짜 선택 -->
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
      </VCardText>
    </VCard>

    <!-- 출석 통계 카드 -->
    <VCard class="mb-6">
      <VCardText class="pa-5">
        <div class="d-flex align-center gap-2 mb-4">
          <VAvatar
            color="primary"
            variant="tonal"
            size="36"
            rounded
          >
            <VIcon icon="mdi-weather-sunny" />
          </VAvatar>
          <span class="text-h6 font-weight-medium">주일오전</span>
          <VSpacer />
          <span class="text-body-2 text-medium-emphasis">{{ summaryLabel }}</span>
        </div>
        <div class="d-flex justify-space-between">
          <div class="text-center flex-grow-1">
            <div class="text-body-2 text-medium-emphasis">
              전체
            </div>
            <div class="text-h6 font-weight-bold">
              {{ summaryStats.total }}명
            </div>
          </div>
          <VDivider vertical />
          <div class="text-center flex-grow-1">
            <div class="text-body-2 text-medium-emphasis">
              출석
            </div>
            <div class="text-h6 font-weight-bold text-success">
              {{ summaryStats.present }}명
            </div>
          </div>
          <VDivider vertical />
          <div class="text-center flex-grow-1">
            <div class="text-body-2 text-medium-emphasis">
              결석
            </div>
            <div class="text-h6 font-weight-bold text-error">
              {{ summaryStats.absent }}명
            </div>
          </div>
          <VDivider vertical />
          <div class="text-center flex-grow-1">
            <div class="text-body-2 text-medium-emphasis">
              출석률
            </div>
            <div class="text-h6 font-weight-bold">
              {{ summaryStats.rate }}%
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

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
            v-for="dept in visibleDeptOrder"
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

          <VSelect
            v-model="selectedFilterDept"
            label="부서"
            :items="departmentFilterOptions"
            multiple
            density="compact"
            clearable
            clear-icon="mdi-close"
            hide-details
            class="filter-select"
          >
            <template #selection="{ item, index }">
              <span
                v-if="index === 0"
                class="text-truncate"
              >{{ item.title }}</span>
              <span
                v-if="index === 1"
                class="text-caption text-medium-emphasis ms-1"
              >(+{{ selectedFilterDept.length - 1 }})</span>
            </template>
          </VSelect>

          <VSelect
            v-model="selectedFilterServiceGroup"
            label="소속"
            :items="serviceGroupFilterOptions"
            multiple
            density="compact"
            clearable
            clear-icon="mdi-close"
            hide-details
            class="filter-select"
          >
            <template #selection="{ item, index }">
              <span
                v-if="index === 0"
                class="text-truncate"
              >{{ item.title }}</span>
              <span
                v-if="index === 1"
                class="text-caption text-medium-emphasis ms-1"
              >(+{{ selectedFilterServiceGroup.length - 1 }})</span>
            </template>
          </VSelect>

          <VSelect
            v-model="selectedFilterBs"
            label="형제/자매"
            :items="bsFilterOptions"
            multiple
            density="compact"
            clearable
            clear-icon="mdi-close"
            hide-details
            class="filter-select"
          >
            <template #selection="{ item, index }">
              <span
                v-if="index === 0"
                class="text-truncate"
              >{{ item.title }}</span>
              <span
                v-if="index === 1"
                class="text-caption text-medium-emphasis ms-1"
              >(+{{ selectedFilterBs.length - 1 }})</span>
            </template>
          </VSelect>
        </div>

        <div class="d-flex align-center flex-wrap gap-4 mb-4">
          <VTextField
            v-model="searchQuery"
            placeholder="이름, 연락처 검색"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            style="min-inline-size: 200px; max-inline-size: 220px;"
            hide-details
            clearable
          />

          <VSpacer />

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
                학생
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
                소속
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
              :class="{ 'text-disabled': !canEdit(record) }"
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
                <div
                  class="d-flex align-center cursor-pointer"
                  @click="openStatsDialog(record)"
                >
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
                      {{ resolveBsLabel(record.bs) }}
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
              <td class="text-center">
                <VChip
                  :color="resolveGroupVariant(record.serviceGroup)"
                  size="small"
                  variant="tonal"
                >
                  {{ record.serviceGroup }}
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
                colspan="5"
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

    <!-- 개인 출석 통계 팝업 -->
    <VDialog
      v-model="isStatsDialogVisible"
      max-width="800"
    >
      <VCard v-if="selectedRecord">
        <VCardText class="d-flex align-center gap-3 pb-0">
          <VAvatar
            :color="deptColorMap[selectedRecord.department] || 'secondary'"
            variant="tonal"
            size="42"
          >
            <VImg
              v-if="selectedRecord.avatar"
              :src="selectedRecord.avatar"
            />
            <span v-else>{{ avatarText(selectedRecord.fullName) }}</span>
          </VAvatar>
          <div>
            <div class="d-flex align-center gap-2">
              <span class="text-h6">{{ selectedRecord.fullName }}</span>
              <VChip
                :color="deptColorMap[selectedRecord.department] || 'secondary'"
                size="small"
              >
                {{ selectedRecord.department }}
              </VChip>
            </div>
            <span class="text-xs text-medium-emphasis">
              {{ resolveBsLabel(selectedRecord.bs) }}<span v-if="selectedRecord.serviceGroup"> · </span>{{ selectedRecord.serviceGroup }}
            </span>
          </div>
          <VSpacer />
          <VBtn
            icon
            variant="text"
            color="default"
            size="small"
            @click="isStatsDialogVisible = false"
          >
            <VIcon icon="mdi-close" />
          </VBtn>
        </VCardText>
        <VCardText>
          <VDivider class="mb-4" />
          <AttendanceStatsRow :user-id="selectedRecord.id" />
        </VCardText>
      </VCard>
    </VDialog>
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

.filter-select {
  inline-size: 150px;
  min-inline-size: 120px;

  .v-field__input {
    flex-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-select__selection {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
