<script setup>
import { avatarText } from '@core/utils/formatters'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit'])

const resolveDeptVariant = dept => {
  if (dept === '교무팀') return { color: 'primary' }
  if (dept === '상담팀') return { color: 'info' }
  if (dept === '초등1반') return { color: 'success' }
  if (dept === '초등2반') return { color: 'warning' }
  if (dept === '초등3반') return { color: 'error' }
  return { color: 'secondary' }
}

const resolveStatusVariant = status => {
  if (status === '현직') return 'success'
  if (status === '휴직') return 'warning'
  if (status === '퇴직') return 'error'
  if (status === '전배') return 'info'
  return 'secondary'
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="props.userData">

        <!-- 아바타 + 이름 -->
        <VCardText class="text-center pt-15">
          <VAvatar
            rounded="sm"
            :size="120"
            :color="resolveDeptVariant(props.userData.department).color"
            variant="tonal"
          >
            <VImg
              v-if="props.userData.avatar"
              :src="props.userData.avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(props.userData.fullName) }}
            </span>
          </VAvatar>

          <h6 class="text-h6 mt-4">
            {{ props.userData.fullName }}
          </h6>
        </VCardText>

        <!-- 봉사 정보 -->
        <VCardText>
          <h6 class="text-h6">
            봉사 정보
          </h6>
          <VDivider class="mt-4 mb-4" />

          <VRow>
            <!-- 부서 -->
            <VCol
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
                  <VIcon icon="mdi-account-group-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    부서
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.department }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 직분 -->
            <VCol
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
                  <VIcon icon="mdi-badge-account-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    직분
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.position }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 상태 -->
            <VCol
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
                  <VIcon icon="mdi-check-circle-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    상태
                  </p>
                  <p class="text-sm font-weight-medium mb-0" :class="`text-${resolveStatusVariant(props.userData.status)}`">
                    {{ props.userData.status }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 담당 -->
            <VCol
              v-if="props.userData.assignedClass"
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
                  <VIcon icon="mdi-school-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    담당
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.assignedClass }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 부가역할 -->
            <VCol
              v-if="props.userData.extraRole"
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
                  <VIcon icon="mdi-star-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    부가역할
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.extraRole }}
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
