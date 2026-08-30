<script setup>
import { avatarText } from '@core/utils/formatters'

const props = defineProps({
  studentData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit'])

// 👉 반별 색상 계열 (목록 화면과 동일한 규칙)
const departmentColor = {
  '초등1반': 'info', // 하늘 계열
  '초등2반': 'success', // 초록 계열
  '초등3반': 'warning', // 주황 계열
}

const resolveGradeVariant = grade => {
  if (grade <= 2) return departmentColor['초등1반']
  if (grade <= 4) return departmentColor['초등2반']

  return departmentColor['초등3반']
}

const classInfo = computed(() =>
  [
    { label: '부서', icon: 'mdi-account-group-outline', value: props.studentData.department },
    { label: '학년 / 반', icon: 'mdi-school-outline', value: `${props.studentData.grade}학년 ${props.studentData.classNo}반` },
    { label: '분반선생님', icon: 'mdi-account-tie-outline', value: props.studentData.teacherName },
    { label: '성별', icon: 'mdi-gender-male-female', value: props.studentData.gender },
  ],
)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="props.studentData">
        <!-- 아바타 + 이름 -->
        <VCardText class="text-center pt-15">
          <VAvatar
            rounded="sm"
            :size="120"
            :color="resolveGradeVariant(props.studentData.grade)"
            variant="tonal"
          >
            <VImg
              v-if="props.studentData.avatar"
              :src="props.studentData.avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(props.studentData.fullName) }}
            </span>
          </VAvatar>

          <h6 class="text-h6 mt-4">
            {{ props.studentData.fullName }}
          </h6>

          <VChip
            :color="resolveGradeVariant(props.studentData.grade)"
            size="small"
            class="mt-2"
          >
            {{ props.studentData.grade }}학년 {{ props.studentData.classNo }}반
          </VChip>
        </VCardText>

        <!-- 분반 정보 -->
        <VCardText>
          <h6 class="text-h6">
            분반 정보
          </h6>
          <VDivider class="mt-4 mb-4" />

          <VRow>
            <VCol
              v-for="item in classInfo"
              :key="item.label"
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-2">
                <VAvatar
                  rounded
                  color="primary"
                  variant="tonal"
                  size="42"
                >
                  <VIcon :icon="item.icon" />
                </VAvatar>
                <div class="overflow-hidden">
                  <p class="text-xs text-medium-emphasis mb-0">
                    {{ item.label }}
                  </p>
                  <p
                    class="text-sm font-weight-medium mb-0"
                    :title="item.value"
                  >
                    {{ item.value || '-' }}
                  </p>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>

        <!-- 수정 버튼 -->
        <VCardText class="d-flex justify-center gap-3">
          <VBtn
            variant="elevated"
            prepend-icon="mdi-pencil-outline"
            @click="emit('edit')"
          >
            수정
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
