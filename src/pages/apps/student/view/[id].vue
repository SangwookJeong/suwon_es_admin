<script setup>
import { useStudentListStore } from '@/views/apps/student/useStudentListStore'
import StudentBioPanel from '@/views/apps/student/view/StudentBioPanel.vue'
import StudentTabOverview from '@/views/apps/student/view/StudentTabOverview.vue'

const studentListStore = useStudentListStore()
const route = useRoute()
const router = useRouter()
const studentData = ref()
const isEditDialogVisible = ref(false)

// 수정 폼 데이터
const editForm = ref({})
const editAvatarPreview = ref('')
const refEditFileInput = ref()

// 분반 구성 (학년/반/분반선생님) + 구역 목록
const classes = ref([])
const districts = ref([])

studentListStore.fetchClasses().then(response => {
  classes.value = response.data.classes
  districts.value = response.data.districts
})

const gradeOptions = [1, 2, 3, 4, 5, 6].map(g => ({ title: `${g}학년`, value: g }))

const editClassNoOptions = computed(() => {
  if (!editForm.value.grade) return []

  return classes.value
    .filter(c => c.grade === editForm.value.grade)
    .map(c => ({ title: `${c.classNo}반`, value: c.classNo }))
})

studentListStore.fetchStudent(Number(route.params.id)).then(response => {
  studentData.value = response.data
})

const onOpenEdit = () => {
  editForm.value = { ...studentData.value }
  editAvatarPreview.value = studentData.value.avatar || ''
  isEditDialogVisible.value = true
}

// 학년/반을 바꾸면 분반선생님이 자동으로 따라옵니다
watch(() => [editForm.value.grade, editForm.value.classNo], ([grade, classNo]) => {
  if (!isEditDialogVisible.value) return

  const matched = classes.value.find(c => c.grade === grade && c.classNo === classNo)

  if (matched)
    editForm.value.teacherName = matched.teacherName
})

const onEditAvatarClick = () => {
  refEditFileInput.value?.click()
}

const onEditFileChange = e => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = ev => {
    editAvatarPreview.value = ev.target.result
    editForm.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onSaveEdit = () => {
  studentListStore.updateStudent(studentData.value.id, editForm.value).then(response => {
    studentData.value = response.data
    isEditDialogVisible.value = false
  })
}
</script>

<template>
  <div>
    <!-- 상단 액션 바 -->
    <div class="d-flex align-center mb-6">
      <VBtn
        variant="text"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="router.push({ name: 'apps-student-list' })"
      >
        학생 목록
      </VBtn>
    </div>

    <VRow v-if="studentData">
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <StudentBioPanel
          :student-data="studentData"
          @edit="onOpenEdit"
        />
      </VCol>

      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <StudentTabOverview :student-data="studentData" />
      </VCol>
    </VRow>

    <!-- 로딩 상태 -->
    <VRow v-else>
      <VCol
        cols="12"
        class="text-center py-10"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <p class="mt-4 text-medium-emphasis">
          학생 정보를 불러오는 중...
        </p>
      </VCol>
    </VRow>

    <!-- 수정 다이얼로그 -->
    <VDialog
      v-model="isEditDialogVisible"
      max-width="700"
    >
      <VCard title="학생 정보 수정">
        <VCardText>
          <VRow>
            <!-- 사진 -->
            <VCol
              cols="12"
              class="d-flex justify-center"
            >
              <div
                class="d-flex flex-column align-center gap-2"
                style="cursor: pointer;"
                @click="onEditAvatarClick"
              >
                <VAvatar
                  :size="100"
                  rounded="sm"
                  color="primary"
                  variant="tonal"
                >
                  <VImg
                    v-if="editAvatarPreview"
                    :src="editAvatarPreview"
                    cover
                  />
                  <VIcon
                    v-else
                    size="48"
                    icon="mdi-camera-plus-outline"
                  />
                </VAvatar>
                <span class="text-sm text-medium-emphasis">사진 변경 (클릭)</span>
              </div>
              <input
                ref="refEditFileInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="onEditFileChange"
              >
            </VCol>

            <!-- 이름 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VTextField
                v-model="editForm.fullName"
                label="이름"
              />
            </VCol>

            <!-- 성별 -->
            <VCol
              cols="12"
              sm="6"
            >
              <VSelect
                v-model="editForm.gender"
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
                v-model="editForm.grade"
                label="학년"
                :items="gradeOptions"
              />
            </VCol>

            <!-- 반 -->
            <VCol
              cols="12"
              sm="4"
            >
              <VSelect
                v-model="editForm.classNo"
                label="반"
                :items="editClassNoOptions"
                :disabled="!editForm.grade"
              />
            </VCol>

            <!-- 분반선생님 -->
            <VCol
              cols="12"
              sm="4"
            >
              <VTextField
                v-model="editForm.teacherName"
                label="분반선생님"
              />
            </VCol>

            <!-- 학생연락처 -->
            <VCol cols="12">
              <VTextField
                v-model="editForm.contact"
                label="학생연락처"
                placeholder="010-0000-0000"
              />
            </VCol>

            <!-- 부모님 성함 -->
            <VCol
              cols="12"
              sm="4"
            >
              <VTextField
                v-model="editForm.parentName"
                label="부모님 성함"
              />
            </VCol>

            <!-- 부모님 연락처 -->
            <VCol
              cols="12"
              sm="4"
            >
              <VTextField
                v-model="editForm.parentContact"
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
                v-model="editForm.parentDistrict"
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
                v-model="editForm.parentSalvation"
                label="부모님 구원여부"
                :items="['구원', '미구원']"
              />
            </VCol>

            <!-- 주소 -->
            <VCol cols="12">
              <VTextField
                v-model="editForm.address"
                label="주소"
              />
            </VCol>

            <!-- 비고 -->
            <VCol cols="12">
              <VTextarea
                v-model="editForm.note"
                label="비고"
                rows="2"
                auto-grow
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isEditDialogVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            variant="elevated"
            color="primary"
            @click="onSaveEdit"
          >
            저장
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
