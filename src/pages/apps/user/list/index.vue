<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import { avatarText } from '@core/utils/formatters'
import { requiredValidator } from '@validators'

const userListStore = useUserListStore()
const router = useRouter()
const searchQuery = ref('')
const selectedDepartment = ref()
const selectedServiceGroup = ref()
const selectedOccupation = ref()
const selectedStatus = ref()
const rowPerPage = ref(20)
const currentPage = ref(1)
const totalPage = ref(1)
const totalUsers = ref(0)
const users = ref([])
const stats = ref(null)

// 👉 통계 조회
userListStore.fetchStats().then(response => {
  stats.value = response.data
})

// 👉 교사 목록 조회
const fetchUsers = () => {
  userListStore.fetchUsers({
    q: searchQuery.value,
    department: selectedDepartment.value,
    serviceGroup: selectedServiceGroup.value,
    occupation: selectedOccupation.value,
    status: selectedStatus.value,
    perPage: rowPerPage.value,
    currentPage: currentPage.value,
  }).then(response => {
    users.value = response.data.users
    totalPage.value = response.data.totalPage
    totalUsers.value = response.data.totalUsers
  }).catch(error => {
    console.error(error)
  })
}

watchEffect(fetchUsers)

watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

// 👉 필터 옵션
const departments = [
  { title: '교무팀', value: '교무팀' },
  { title: '상담팀', value: '상담팀' },
  { title: '초등1반', value: '초등1반' },
  { title: '초등2반', value: '초등2반' },
  { title: '초등3반', value: '초등3반' },
]

const serviceGroups = [
  { title: '봉사회', value: '봉사회' },
  { title: '어머니회', value: '어머니회' },
  { title: '청년회', value: '청년회' },
]

const occupations = [
  { title: '직장인', value: '직장인' },
  { title: '대학생', value: '대학생' },
  { title: '주부', value: '주부' },
]

const statuses = [
  { title: '현직', value: '현직' },
  { title: '휴직', value: '휴직' },
  { title: '퇴직', value: '퇴직' },
  { title: '전배', value: '전배' },
]

const deptOrder = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']

// 👉 부서별 색상
const resolveDeptVariant = dept => {
  if (dept === '교무팀') return { color: 'primary' }
  if (dept === '상담팀') return { color: 'info' }
  if (dept === '초등1반') return { color: 'success' }
  if (dept === '초등2반') return { color: 'warning' }
  if (dept === '초등3반') return { color: 'error' }
  return { color: 'secondary' }
}

// 👉 소속별 색상
const resolveGroupVariant = group => {
  if (group === '봉사회') return 'primary'
  if (group === '어머니회') return 'info'
  if (group === '청년회') return 'success'
  return 'secondary'
}

// 👉 상태별 색상
const resolveStatusVariant = status => {
  if (status === '현직') return 'success'
  if (status === '휴직') return 'warning'
  if (status === '퇴직') return 'error'
  if (status === '전배') return 'info'
  return 'secondary'
}

const selectedUsers = ref([])

const selectAllUsers = computed({
  get: () => users.value.length > 0 && selectedUsers.value.length === users.value.length,
  set: val => {
    selectedUsers.value = val ? users.value.map(u => u.id) : []
  },
})

const isIndeterminate = computed(() =>
  selectedUsers.value.length > 0 && selectedUsers.value.length < users.value.length,
)

const toggleUser = userId => {
  const idx = selectedUsers.value.indexOf(userId)
  if (idx === -1)
    selectedUsers.value.push(userId)
  else
    selectedUsers.value.splice(idx, 1)
}

const isAddDialogVisible = ref(false)
const addForm = ref({})
const addAvatarPreview = ref('')
const refAddFileInput = ref()
const refAddForm = ref()

const departmentItems = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']
const serviceGroupItems = ['봉사회', '어머니회', '청년회']
const bsOptions = [
  { title: '형제 (B)', value: 'B' },
  { title: '자매 (S)', value: 'S' },
]
const occupationItems = ['직장인', '대학생', '주부']
const statusItems = ['현직', '휴직', '퇴직', '전배']

const onOpenAdd = () => {
  addForm.value = {
    fullName: '',
    department: null,
    position: '',
    assignedClass: '',
    extraRole: '',
    contact: '',
    serviceGroup: null,
    bs: null,
    occupation: null,
    salvationBirthday: '',
    status: '현직',
  }
  addAvatarPreview.value = ''
  isAddDialogVisible.value = true
}

const onAddAvatarClick = () => {
  refAddFileInput.value?.click()
}

const onAddFileChange = e => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    addAvatarPreview.value = ev.target.result
    addForm.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onSaveAdd = () => {
  refAddForm.value?.validate().then(({ valid }) => {
    if (valid) {
      userListStore.addUser({
        id: 0,
        avatar: addAvatarPreview.value,
        ...addForm.value,
        bs: addForm.value.bs ?? '',
        occupation: addForm.value.occupation ?? '',
        serviceHistory: [],
      })
      isAddDialogVisible.value = false
      fetchUsers()
    }
  })
}

// 👉 페이지네이션 텍스트
const paginationData = computed(() => {
  const firstIndex = users.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0
  const lastIndex = users.value.length + (currentPage.value - 1) * rowPerPage.value

  return `${firstIndex}-${lastIndex} / 전체 ${totalUsers.value}명`
})

// 👉 행 클릭 → 상세 페이지 이동
const onRowClick = user => {
  router.push({ name: 'apps-user-view-id', params: { id: user.id } })
}

</script>

<template>
  <section>
    <!-- 👉 요약 정보 -->
    <VCard
      v-if="stats"
      class="mb-6"
    >
      <VCardText class="d-flex flex-wrap align-center gap-x-6 gap-y-3">
        <!-- 전체 교사 -->
        <div class="d-flex align-center gap-3">
          <VAvatar
            color="primary"
            variant="tonal"
            size="40"
            rounded
          >
            <VIcon icon="mdi-account-group" />
          </VAvatar>
          <div>
            <div class="text-h6 font-weight-bold">
              {{ stats.total }}명
            </div>
            <div class="text-xs text-medium-emphasis">
              전체 교사
            </div>
          </div>
        </div>

        <VDivider
          vertical
          class="my-2"
        />

        <!-- 부서별 인원 -->
        <div class="d-flex flex-wrap align-center gap-2">
          <VChip
            v-for="dept in deptOrder"
            :key="dept"
            :color="resolveDeptVariant(dept).color"
            size="small"
            variant="tonal"
          >
            {{ dept }} {{ stats.deptCounts[dept] || 0 }}
          </VChip>
        </div>

        <VDivider
          vertical
          class="my-2"
        />

        <!-- 상태별 인원 -->
        <div class="d-flex flex-wrap align-center gap-2">
          <VChip
            v-for="s in ['현직', '휴직', '퇴직', '전배']"
            :key="s"
            :color="resolveStatusVariant(s)"
            size="small"
            variant="tonal"
          >
            {{ s }} {{ stats.statusCounts[s] || 0 }}
          </VChip>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 교사 목록 -->
    <VCard>
      <!-- 필터 + 검색 + 추가 버튼 -->
      <VCardText class="d-flex flex-wrap align-center gap-4">
        <VSelect
          v-model="selectedDepartment"
          label="부서"
          :items="departments"
          density="compact"
          clearable
          clear-icon="mdi-close"
          hide-details
          class="filter-select"
        />

        <VSelect
          v-model="selectedServiceGroup"
          label="소속"
          :items="serviceGroups"
          density="compact"
          clearable
          clear-icon="mdi-close"
          hide-details
          class="filter-select"
        />

        <VSelect
          v-model="selectedOccupation"
          label="직업"
          :items="occupations"
          density="compact"
          clearable
          clear-icon="mdi-close"
          hide-details
          class="filter-select"
        />

        <VSelect
          v-model="selectedStatus"
          label="상태"
          :items="statuses"
          density="compact"
          clearable
          clear-icon="mdi-close"
          hide-details
          class="filter-select"
        />

        <VTextField
          v-model="searchQuery"
          placeholder="이름 또는 연락처 검색"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          style="max-inline-size: 220px; min-inline-size: 180px;"
        />

        <VSpacer />

        <VBtn
          prepend-icon="mdi-plus"
          @click="onOpenAdd"
        >
          교사 추가
        </VBtn>
      </VCardText>

      <!-- 👉 선택 시 일괄 액션 바 -->
      <VExpandTransition>
        <div v-if="selectedUsers.length > 0">
          <VDivider />
          <VCardText class="d-flex align-center gap-4 bg-var-theme-background">
            <span class="text-body-2 font-weight-medium">
              {{ selectedUsers.length }}명 선택됨
            </span>

            <VSpacer />

            <VBtn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-pencil-outline"
            >
              일괄 수정
            </VBtn>
            <VBtn
              size="small"
              variant="tonal"
              color="error"
              prepend-icon="mdi-delete-outline"
            >
              일괄 삭제
            </VBtn>
            <VBtn
              size="small"
              variant="text"
              color="secondary"
              @click="selectedUsers = []"
            >
              선택 해제
            </VBtn>
          </VCardText>
        </div>
      </VExpandTransition>

      <VDivider />

      <!-- 👉 교사 테이블 -->
      <VTable class="text-no-wrap teacher-table">
        <thead>
          <tr>
            <th
              scope="col"
              style="width: 48px;"
            >
              <VCheckbox
                v-model="selectAllUsers"
                :indeterminate="isIndeterminate"
                hide-details
              />
            </th>
            <th
              scope="col"
              class="text-center"
            >
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
              연락처
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
              상태
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="cursor-pointer"
            @click="onRowClick(user)"
          >
            <!-- 체크박스 -->
            <td @click.stop>
              <VCheckbox
                :model-value="selectedUsers.includes(user.id)"
                hide-details
                @update:model-value="toggleUser(user.id)"
              />
            </td>

            <!-- 교사 -->
            <td>
              <div class="d-flex align-center">
                <VAvatar
                  variant="tonal"
                  :color="resolveDeptVariant(user.department).color"
                  class="me-3"
                  size="34"
                >
                  <VImg
                    v-if="user.avatar"
                    :src="user.avatar"
                  />
                  <span v-else>{{ avatarText(user.fullName) }}</span>
                </VAvatar>

                <div class="d-flex flex-column">
                  <span class="text-sm font-weight-medium text-high-emphasis">
                    {{ user.fullName }}
                  </span>
                  <span class="text-xs text-medium-emphasis">{{ user.bs === 'B' ? '형제' : '자매' }}</span>
                </div>
              </div>
            </td>

            <!-- 부서 -->
            <td class="text-center">
              <VChip
                :color="resolveDeptVariant(user.department).color"
                size="small"
              >
                {{ user.department }}
              </VChip>
            </td>

            <!-- 직분 -->
            <td class="text-center text-medium-emphasis">
              {{ user.position }}
            </td>

            <!-- 담당 -->
            <td class="text-center text-medium-emphasis">
              <span v-if="user.assignedClass">{{ user.assignedClass }}</span>
              <span
                v-else
                class="text-disabled"
              >-</span>
            </td>

            <!-- 연락처 -->
            <td class="text-center text-medium-emphasis">
              {{ user.contact }}
            </td>

            <!-- 소속 -->
            <td class="text-center">
              <VChip
                :color="resolveGroupVariant(user.serviceGroup)"
                size="small"
                variant="tonal"
              >
                {{ user.serviceGroup }}
              </VChip>
            </td>

            <!-- 상태 -->
            <td class="text-center">
              <VChip
                :color="resolveStatusVariant(user.status)"
                size="small"
                variant="tonal"
              >
                {{ user.status }}
              </VChip>
            </td>
          </tr>
        </tbody>

        <tfoot v-show="!users.length">
          <tr>
            <td
              colspan="8"
              class="text-center"
            >
              검색 결과가 없습니다
            </td>
          </tr>
        </tfoot>
      </VTable>

      <VDivider />

      <!-- 👉 페이지네이션 -->
      <VCardText class="d-flex align-center flex-wrap justify-end gap-4 pa-2">
        <div class="d-flex align-center me-3">
          <span class="text-no-wrap text-sm me-2">페이지당 행수:</span>
          <select
            :value="rowPerPage"
            class="pagination-native-select text-sm"
            @change="rowPerPage = Number($event.target.value)"
          >
            <option
              v-for="n in [10, 20, 30, 50]"
              :key="n"
              :value="n"
            >
              {{ n }}
            </option>
          </select>
        </div>

        <div class="d-flex align-center">
          <h6 class="text-sm font-weight-regular">
            {{ paginationData }}
          </h6>

          <VPagination
            v-model="currentPage"
            size="small"
            :total-visible="1"
            :length="totalPage"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 교사 추가 다이얼로그 -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="600"
    >
      <VCard title="교사 추가">
        <VCardText>
          <VForm
            ref="refAddForm"
            @submit.prevent="onSaveAdd"
          >
            <VRow>
              <!-- 사진 -->
              <VCol
                cols="12"
                class="d-flex justify-center"
              >
                <div
                  class="d-flex flex-column align-center gap-2"
                  style="cursor: pointer;"
                  @click="onAddAvatarClick"
                >
                  <VAvatar
                    :size="100"
                    rounded="sm"
                    color="primary"
                    variant="tonal"
                  >
                    <VImg
                      v-if="addAvatarPreview"
                      :src="addAvatarPreview"
                      cover
                    />
                    <VIcon
                      v-else
                      size="48"
                      icon="mdi-camera-plus-outline"
                    />
                  </VAvatar>
                  <span class="text-sm text-medium-emphasis">사진 등록 (클릭)</span>
                </div>
                <input
                  ref="refAddFileInput"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onAddFileChange"
                >
              </VCol>

              <!-- 이름 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.fullName"
                  :rules="[requiredValidator]"
                  label="이름"
                />
              </VCol>

              <!-- 부서 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.department"
                  label="부서"
                  :rules="[requiredValidator]"
                  :items="departmentItems"
                />
              </VCol>

              <!-- 직분 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.position"
                  :rules="[requiredValidator]"
                  label="직분"
                  placeholder="반장, 분반교사, 상담인 등"
                />
              </VCol>

              <!-- 담당 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.assignedClass"
                  label="담당"
                  placeholder="1-1반, 특수 (남) 등"
                />
              </VCol>

              <!-- 부가역할 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.extraRole"
                  label="부가역할"
                  placeholder="피아노, 손유희팀장 등"
                />
              </VCol>

              <!-- 연락처 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.contact"
                  :rules="[requiredValidator]"
                  label="연락처"
                  placeholder="010-0000-0000"
                />
              </VCol>

              <!-- 소속 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.serviceGroup"
                  label="소속"
                  :rules="[requiredValidator]"
                  :items="serviceGroupItems"
                />
              </VCol>

              <!-- B/S -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.bs"
                  label="B/S (형제/자매)"
                  :rules="[requiredValidator]"
                  :items="bsOptions"
                />
              </VCol>

              <!-- 직업 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.occupation"
                  label="직업"
                  :items="occupationItems"
                  clearable
                  clear-icon="mdi-close"
                />
              </VCol>

              <!-- 상태 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.status"
                  label="상태"
                  :items="statusItems"
                />
              </VCol>

              <!-- 구원생일 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="addForm.salvationBirthday"
                  label="구원생일"
                  placeholder="YY.MM.DD"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isAddDialogVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            variant="elevated"
            color="primary"
            @click="onSaveAdd"
          >
            저장
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss">
.teacher-table {
  th,
  td {
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

<style lang="scss" scoped>
.pagination-native-select {
  appearance: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px 4px;
  color: inherit;

  &:focus {
    outline: none;
  }
}
</style>
