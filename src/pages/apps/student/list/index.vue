<script setup>
import { useStudentListStore } from '@/views/apps/student/useStudentListStore'
import { avatarText } from '@core/utils/formatters'
import { requiredValidator } from '@validators'

const studentListStore = useStudentListStore()
const router = useRouter()

const searchQuery = ref('')
const selectedDepartment = ref([])
const selectedGrade = ref([])
const selectedClassNo = ref([])
const selectedTeacher = ref([])
const selectedDistrict = ref([])
const selectedSalvation = ref([])
const rowPerPage = ref(20)
const currentPage = ref(1)
const totalPage = ref(1)
const totalStudents = ref(0)
const students = ref([])
const stats = ref(null)

// 👉 분반 구성 (학년/반/분반선생님) + 구역 목록
const classes = ref([])
const districts = ref([])

studentListStore.fetchClasses().then(response => {
  classes.value = response.data.classes
  districts.value = response.data.districts
})

// 👉 통계 조회
const fetchStats = () => studentListStore.fetchStats().then(response => {
  stats.value = response.data
})

fetchStats()

// 👉 학생 목록 조회
const fetchStudents = () => {
  studentListStore.fetchStudents({
    q: searchQuery.value,
    department: selectedDepartment.value,
    grade: selectedGrade.value,
    classNo: selectedClassNo.value,
    teacherName: selectedTeacher.value,
    parentDistrict: selectedDistrict.value,
    parentSalvation: selectedSalvation.value,
    perPage: rowPerPage.value,
    currentPage: currentPage.value,
  }).then(response => {
    students.value = response.data.students
    totalPage.value = response.data.totalPage
    totalStudents.value = response.data.totalStudents
  }).catch(error => {
    console.error(error)
  })
}

watchEffect(fetchStudents)

watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

// 👉 필터 옵션
// 부서 구성: 1~2학년 = 초등1반, 3~4학년 = 초등2반, 5~6학년 = 초등3반
const departmentOrder = ['초등1반', '초등2반', '초등3반']
const departmentOptions = departmentOrder.map(d => ({ title: d, value: d }))

const gradesOfDepartment = {
  '초등1반': [1, 2],
  '초등2반': [3, 4],
  '초등3반': [5, 6],
}

const grades = [1, 2, 3, 4, 5, 6]
const gradeOptions = grades.map(g => ({ title: `${g}학년`, value: g }))

const classNoOptions = computed(() => {
  const nos = [...new Set(classes.value.map(c => c.classNo))].sort((a, b) => a - b)

  return nos.map(n => ({ title: `${n}반`, value: n }))
})

const teacherOptions = computed(() =>
  [...new Set(classes.value.map(c => c.teacherName))].sort().map(t => ({ title: t, value: t })),
)

const districtOptions = computed(() => districts.value.map(d => ({ title: d, value: d })))

const salvationOptions = [
  { title: '구원', value: '구원' },
  { title: '미구원', value: '미구원' },
]

// 👉 반별 색상 계열 — 초등1/2/3반이 서로 다른 색 계열을 쓰도록 구분합니다.
//    (error/빨강은 삭제·경고용, primary/남색은 버튼용이라 비워뒀습니다)
const departmentColor = {
  '초등1반': 'info', // 하늘 계열
  '초등2반': 'success', // 초록 계열
  '초등3반': 'warning', // 주황 계열
}

const resolveDeptVariant = dept => departmentColor[dept] ?? 'secondary'

const departmentOfGrade = grade => {
  if (grade <= 2) return '초등1반'
  if (grade <= 4) return '초등2반'

  return '초등3반'
}

// 👉 학년 칩은 소속 반의 색 계열을 연한 톤(tonal)으로 씁니다.
//    진한 색(flat)은 상위 항목인 반 칩에만 써서 반 > 학년 위계가 보이게 합니다.
const resolveGradeVariant = grade => resolveDeptVariant(departmentOfGrade(grade))

// 👉 부모님 구원여부 색상
const resolveSalvationVariant = salvation => (salvation === '구원' ? 'success' : 'warning')

const selectedStudents = ref([])

const selectAllStudents = computed({
  get: () => students.value.length > 0 && selectedStudents.value.length === students.value.length,
  set: val => {
    selectedStudents.value = val ? students.value.map(s => s.id) : []
  },
})

const isIndeterminate = computed(() =>
  selectedStudents.value.length > 0 && selectedStudents.value.length < students.value.length,
)

const toggleStudent = studentId => {
  const idx = selectedStudents.value.indexOf(studentId)
  if (idx === -1)
    selectedStudents.value.push(studentId)
  else
    selectedStudents.value.splice(idx, 1)
}

// 👉 학생 추가 다이얼로그
const isAddDialogVisible = ref(false)
const addForm = ref({})
const addAvatarPreview = ref('')
const refAddFileInput = ref()
const refAddForm = ref()

// 학년/반을 고르면 분반선생님이 자동으로 채워집니다
const addClassNoOptions = computed(() => {
  if (!addForm.value.grade) return []

  return classes.value
    .filter(c => c.grade === addForm.value.grade)
    .map(c => ({ title: `${c.classNo}반`, value: c.classNo }))
})

watch(() => [addForm.value.grade, addForm.value.classNo], ([grade, classNo]) => {
  const matched = classes.value.find(c => c.grade === grade && c.classNo === classNo)

  addForm.value.teacherName = matched?.teacherName ?? ''
})

const onOpenAdd = () => {
  addForm.value = {
    fullName: '',
    gender: '남',
    grade: null,
    classNo: null,
    teacherName: '',
    address: '',
    contact: '',
    parentName: '',
    parentContact: '',
    parentDistrict: null,
    parentSalvation: '구원',
    note: '',
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

const onSaveAdd = async () => {
  const { valid } = await refAddForm.value.validate()

  if (!valid) return

  await studentListStore.addStudent({
    id: 0,
    avatar: addAvatarPreview.value,
    ...addForm.value,
  })

  isAddDialogVisible.value = false
  fetchStudents()
  fetchStats()
}

// 👉 페이지네이션 텍스트
const paginationData = computed(() => {
  const firstIndex = students.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0
  const lastIndex = students.value.length + (currentPage.value - 1) * rowPerPage.value

  return `${firstIndex}-${lastIndex} / 전체 ${totalStudents.value}명`
})

// 👉 행 클릭 → 상세 페이지 이동
const onRowClick = student => {
  router.push({ name: 'apps-student-view-id', params: { id: student.id } })
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
        <!-- 전체 학생 -->
        <div class="d-flex align-center gap-3">
          <VAvatar
            color="primary"
            variant="tonal"
            size="40"
            rounded
          >
            <VIcon icon="mdi-account-school-outline" />
          </VAvatar>
          <div>
            <div class="text-h6 font-weight-bold">
              {{ stats.total }}명
            </div>
            <div class="text-xs text-medium-emphasis">
              전체 학생
            </div>
          </div>
        </div>

        <VDivider
          vertical
          class="my-2"
        />

        <!-- 부서별 인원 (1~2학년 = 초등1반, 3~4학년 = 초등2반, 5~6학년 = 초등3반) -->
        <div class="d-flex flex-wrap align-center gap-x-4 gap-y-3">
          <template
            v-for="(dept, index) in departmentOrder"
            :key="dept"
          >
            <!-- 반과 반 사이 구분자 -->
            <VDivider
              v-if="index > 0"
              vertical
              class="my-2"
            />

            <div class="d-flex align-center gap-2">
              <VChip
                :color="resolveDeptVariant(dept)"
                variant="flat"
                size="small"
              >
                {{ dept }} {{ stats.deptCounts[dept] || 0 }}
              </VChip>

              <div class="d-flex align-center gap-1">
                <VChip
                  v-for="grade in gradesOfDepartment[dept]"
                  :key="grade"
                  :color="resolveGradeVariant(grade)"
                  variant="tonal"
                  size="x-small"
                >
                  {{ grade }}학년 {{ stats.gradeCounts[grade] || 0 }}
                </VChip>
              </div>
            </div>
          </template>
        </div>
      </VCardText>
    </VCard>

    <!-- 👉 학생 목록 -->
    <VCard>
      <!-- 필터 + 검색 + 추가 버튼 -->
      <VCardText class="d-flex flex-wrap align-center gap-4">
        <VSelect
          v-model="selectedDepartment"
          label="부서"
          :items="departmentOptions"
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
            >(+{{ selectedDepartment.length - 1 }})</span>
          </template>
        </VSelect>

        <VSelect
          v-model="selectedGrade"
          label="학년"
          :items="gradeOptions"
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
            >(+{{ selectedGrade.length - 1 }})</span>
          </template>
        </VSelect>

        <VSelect
          v-model="selectedClassNo"
          label="반"
          :items="classNoOptions"
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
            >(+{{ selectedClassNo.length - 1 }})</span>
          </template>
        </VSelect>

        <VSelect
          v-model="selectedTeacher"
          label="분반선생님"
          :items="teacherOptions"
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
            >(+{{ selectedTeacher.length - 1 }})</span>
          </template>
        </VSelect>

        <VSelect
          v-model="selectedDistrict"
          label="부모님 구역"
          :items="districtOptions"
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
            >(+{{ selectedDistrict.length - 1 }})</span>
          </template>
        </VSelect>

        <VSelect
          v-model="selectedSalvation"
          label="구원여부"
          :items="salvationOptions"
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
            >(+{{ selectedSalvation.length - 1 }})</span>
          </template>
        </VSelect>

        <VTextField
          v-model="searchQuery"
          placeholder="이름·학생/부모님 연락처·주소 검색"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          style="max-inline-size: 260px; min-inline-size: 200px;"
        />

        <VSpacer />

        <VBtn
          prepend-icon="mdi-plus"
          @click="onOpenAdd"
        >
          학생 추가
        </VBtn>
      </VCardText>

      <!-- 👉 선택 시 일괄 액션 바 -->
      <VExpandTransition>
        <div v-if="selectedStudents.length > 0">
          <VDivider />
          <VCardText class="d-flex align-center gap-4 bg-var-theme-background">
            <span class="text-body-2 font-weight-medium">
              {{ selectedStudents.length }}명 선택됨
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
              @click="selectedStudents = []"
            >
              선택 해제
            </VBtn>
          </VCardText>
        </div>
      </VExpandTransition>

      <VDivider />

      <!-- 👉 학생 테이블 -->
      <div class="student-table-wrapper">
        <VTable class="text-no-wrap student-table">
          <thead>
            <tr>
              <th
                scope="col"
                style="inline-size: 48px;"
              >
                <VCheckbox
                  v-model="selectAllStudents"
                  :indeterminate="isIndeterminate"
                  hide-details
                />
              </th>
              <th scope="col">
                이름
              </th>
              <th
                scope="col"
                class="text-center"
              >
                학년
              </th>
              <th
                scope="col"
                class="text-center"
              >
                반
              </th>
              <th
                scope="col"
                class="text-center"
              >
                분반선생님
              </th>
              <th
                scope="col"
                class="text-center"
              >
                학생연락처
              </th>
              <th
                scope="col"
                class="text-center"
              >
                부모님 성함
              </th>
              <th
                scope="col"
                class="text-center"
              >
                부모님 연락처
              </th>
              <th
                scope="col"
                class="text-center"
              >
                부모님 구역
              </th>
              <th
                scope="col"
                class="text-center"
              >
                부모님 구원여부
              </th>
              <th scope="col">
                주소
              </th>
              <th scope="col">
                비고
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="student in students"
              :key="student.id"
              class="cursor-pointer"
              @click="onRowClick(student)"
            >
              <!-- 체크박스 -->
              <td @click.stop>
                <VCheckbox
                  :model-value="selectedStudents.includes(student.id)"
                  hide-details
                  @update:model-value="toggleStudent(student.id)"
                />
              </td>

              <!-- 이름 -->
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    variant="tonal"
                    :color="resolveGradeVariant(student.grade)"
                    class="me-3"
                    size="34"
                  >
                    <VImg
                      v-if="student.avatar"
                      :src="student.avatar"
                    />
                    <span v-else>{{ avatarText(student.fullName) }}</span>
                  </VAvatar>

                  <div class="d-flex flex-column">
                    <span class="text-sm font-weight-medium text-high-emphasis">
                      {{ student.fullName }}
                    </span>
                    <span class="text-xs text-medium-emphasis">{{ student.gender }}</span>
                  </div>
                </div>
              </td>

              <!-- 학년 -->
              <td class="text-center">
                <VChip
                  :color="resolveGradeVariant(student.grade)"
                  variant="tonal"
                  size="small"
                >
                  {{ student.grade }}학년
                </VChip>
              </td>

              <!-- 반 -->
              <td class="text-center text-medium-emphasis">
                {{ student.classNo }}반
              </td>

              <!-- 분반선생님 -->
              <td class="text-center text-medium-emphasis">
                {{ student.teacherName }}
              </td>

              <!-- 학생연락처 -->
              <td class="text-center text-medium-emphasis">
                <span v-if="student.contact">{{ student.contact }}</span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </td>

              <!-- 부모님 성함 -->
              <td class="text-center text-medium-emphasis">
                {{ student.parentName }}
              </td>

              <!-- 부모님 연락처 -->
              <td class="text-center text-medium-emphasis">
                {{ student.parentContact }}
              </td>

              <!-- 부모님 구역 -->
              <td class="text-center text-medium-emphasis">
                {{ student.parentDistrict }}
              </td>

              <!-- 부모님 구원여부 -->
              <td class="text-center">
                <VChip
                  :color="resolveSalvationVariant(student.parentSalvation)"
                  size="small"
                  variant="tonal"
                >
                  {{ student.parentSalvation }}
                </VChip>
              </td>

              <!-- 주소 -->
              <td
                class="text-medium-emphasis text-truncate"
                style="max-inline-size: 260px;"
                :title="student.address"
              >
                {{ student.address }}
              </td>

              <!-- 비고 -->
              <td
                class="text-medium-emphasis text-truncate"
                style="max-inline-size: 220px;"
                :title="student.note"
              >
                <span v-if="student.note">{{ student.note }}</span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </td>
            </tr>
          </tbody>

          <tfoot v-show="!students.length">
            <tr>
              <td
                colspan="12"
                class="text-center"
              >
                검색 결과가 없습니다
              </td>
            </tr>
          </tfoot>
        </VTable>
      </div>

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

    <!-- 👉 학생 추가 다이얼로그 -->
    <VDialog
      v-model="isAddDialogVisible"
      max-width="700"
    >
      <VCard title="학생 추가">
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

              <!-- 성별 -->
              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="addForm.gender"
                  label="성별"
                  :items="['남', '여']"
                />
              </VCol>

              <!-- 학년 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VSelect
                  v-model="addForm.grade"
                  label="학년"
                  :rules="[requiredValidator]"
                  :items="gradeOptions"
                />
              </VCol>

              <!-- 반 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VSelect
                  v-model="addForm.classNo"
                  label="반"
                  :rules="[requiredValidator]"
                  :items="addClassNoOptions"
                  :disabled="!addForm.grade"
                />
              </VCol>

              <!-- 분반선생님 (학년/반 선택 시 자동 입력) -->
              <VCol
                cols="12"
                sm="4"
              >
                <VTextField
                  v-model="addForm.teacherName"
                  label="분반선생님"
                  placeholder="학년/반 선택 시 자동 입력"
                />
              </VCol>

              <!-- 학생연락처 -->
              <VCol cols="12">
                <VTextField
                  v-model="addForm.contact"
                  label="학생연락처"
                  placeholder="010-0000-0000 (없으면 비워두세요)"
                />
              </VCol>

              <!-- 부모님 성함 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VTextField
                  v-model="addForm.parentName"
                  :rules="[requiredValidator]"
                  label="부모님 성함"
                />
              </VCol>

              <!-- 부모님 연락처 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VTextField
                  v-model="addForm.parentContact"
                  :rules="[requiredValidator]"
                  label="부모님 연락처"
                  placeholder="010-0000-0000"
                />
              </VCol>

              <!-- 부모님 구역 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VCombobox
                  v-model="addForm.parentDistrict"
                  label="부모님 구역"
                  :items="districts"
                />
              </VCol>

              <!-- 부모님 구원여부 -->
              <VCol
                cols="12"
                sm="4"
              >
                <VSelect
                  v-model="addForm.parentSalvation"
                  label="부모님 구원여부"
                  :items="['구원', '미구원']"
                />
              </VCol>

              <!-- 주소 -->
              <VCol cols="12">
                <VTextField
                  v-model="addForm.address"
                  label="주소"
                  placeholder="경기 수원시 영통구 매탄동 ..."
                />
              </VCol>

              <!-- 비고 -->
              <VCol cols="12">
                <VTextarea
                  v-model="addForm.note"
                  label="비고"
                  rows="2"
                  auto-grow
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
.student-table-wrapper {
  overflow-x: auto;
}

.student-table {
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
