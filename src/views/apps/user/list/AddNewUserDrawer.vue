<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { requiredValidator } from '@validators'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const isFormValid = ref(false)
const refForm = ref()

// 👉 사진 업로드
const avatarPreview = ref('')
const refFileInput = ref()

const onAvatarClick = () => {
  refFileInput.value?.click()
}

const onFileChange = e => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

const fullName = ref('')
const department = ref()
const position = ref('')
const assignedClass = ref('')
const extraRole = ref('')
const contact = ref('')
const serviceGroup = ref()
const bs = ref()
const occupation = ref()
const salvationBirthday = ref('')
const status = ref('현직')

const departments = ['교무팀', '상담팀', '초등1반', '초등2반', '초등3반']
const serviceGroups = ['봉사회', '어머니회', '청년회']
const bsOptions = [
  { title: '형제 (B)', value: 'B' },
  { title: '자매 (S)', value: 'S' },
]
const occupations = ['직장인', '대학생', '주부']
const statuses = ['현직', '휴직', '퇴직', '전배']

// 👉 드로어 닫기
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
    avatarPreview.value = ''
  })
}

// 👉 폼 제출
const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        id: 0,
        avatar: avatarPreview.value,
        fullName: fullName.value,
        department: department.value,
        position: position.value,
        assignedClass: assignedClass.value,
        extraRole: extraRole.value,
        contact: contact.value,
        serviceGroup: serviceGroup.value,
        bs: bs.value ?? '',
        occupation: occupation.value ?? '',
        salvationBirthday: salvationBirthday.value,
        status: status.value,
        serviceHistory: [],
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
        avatarPreview.value = ''
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="420"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 제목 -->
    <div class="d-flex align-center bg-var-theme-background px-5 py-2">
      <h6 class="text-h6">
        교사 추가
      </h6>

      <VSpacer />

      <VBtn
        size="small"
        color="secondary"
        variant="text"
        icon="mdi-close"
        @click="closeNavigationDrawer"
      />
    </div>

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 사진 업로드 -->
              <VCol
                cols="12"
                class="d-flex justify-center"
              >
                <div
                  class="d-flex flex-column align-center gap-3"
                  style="cursor: pointer;"
                  @click="onAvatarClick"
                >
                  <VAvatar
                    :size="100"
                    rounded="sm"
                    color="primary"
                    variant="tonal"
                  >
                    <VImg
                      v-if="avatarPreview"
                      :src="avatarPreview"
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
                  ref="refFileInput"
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  @change="onFileChange"
                >
              </VCol>

              <!-- 이름 -->
              <VCol cols="12">
                <VTextField
                  v-model="fullName"
                  :rules="[requiredValidator]"
                  label="이름"
                />
              </VCol>

              <!-- 부서 -->
              <VCol cols="12">
                <VSelect
                  v-model="department"
                  label="부서"
                  :rules="[requiredValidator]"
                  :items="departments"
                />
              </VCol>

              <!-- 직분 -->
              <VCol cols="12">
                <VTextField
                  v-model="position"
                  :rules="[requiredValidator]"
                  label="직분"
                  placeholder="반장, 분반교사, 상담인 등"
                />
              </VCol>

              <!-- 담당 (초등반만) -->
              <VCol
                v-if="['초등1반', '초등2반', '초등3반'].includes(department)"
                cols="12"
              >
                <VTextField
                  v-model="assignedClass"
                  label="담당"
                  placeholder="1-1반, 특수 (남) 등"
                />
              </VCol>

              <!-- 부가역할 -->
              <VCol cols="12">
                <VTextField
                  v-model="extraRole"
                  label="부가역할"
                  placeholder="피아노, 손유희팀장 등"
                />
              </VCol>

              <!-- 연락처 -->
              <VCol cols="12">
                <VTextField
                  v-model="contact"
                  :rules="[requiredValidator]"
                  label="연락처"
                  placeholder="010-0000-0000"
                />
              </VCol>

              <!-- 소속 -->
              <VCol cols="12">
                <VSelect
                  v-model="serviceGroup"
                  label="소속"
                  :rules="[requiredValidator]"
                  :items="serviceGroups"
                />
              </VCol>

              <!-- B/S -->
              <VCol cols="12">
                <VSelect
                  v-model="bs"
                  label="B/S (형제/자매)"
                  :rules="[requiredValidator]"
                  :items="bsOptions"
                />
              </VCol>

              <!-- 직업 -->
              <VCol cols="12">
                <VSelect
                  v-model="occupation"
                  label="직업"
                  :items="occupations"
                  clearable
                  clear-icon="mdi-close"
                />
              </VCol>

              <!-- 상태 -->
              <VCol cols="12">
                <VSelect
                  v-model="status"
                  label="상태"
                  :items="statuses"
                />
              </VCol>

              <!-- 구원생일 -->
              <VCol cols="12">
                <VTextField
                  v-model="salvationBirthday"
                  label="구원생일"
                  placeholder="YY.MM.DD"
                />
              </VCol>

              <!-- 저장 / 취소 -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  저장
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="secondary"
                  @click="closeNavigationDrawer"
                >
                  취소
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
