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

const resolveGroupVariant = group => {
  if (group === '봉사회') return 'primary'
  if (group === '어머니회') return 'info'
  if (group === '청년회') return 'success'
  return 'secondary'
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

        <!-- 아바타 + 이름 + 부서 + 직분 -->
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

          <div class="d-flex justify-center gap-2 mt-3">
            <VChip
              label
              :color="resolveDeptVariant(props.userData.department).color"
              size="small"
            >
              {{ props.userData.department }}
            </VChip>
            <VChip
              label
              color="secondary"
              size="small"
              variant="outlined"
            >
              {{ props.userData.position }}
            </VChip>
            <VChip
              label
              :color="resolveStatusVariant(props.userData.status)"
              size="small"
              variant="tonal"
            >
              {{ props.userData.status }}
            </VChip>
          </div>
        </VCardText>

        <!-- B/S / 소속 요약 -->
        <VCardText class="d-flex justify-center flex-wrap gap-6 mt-1">
          <div class="d-flex align-center gap-3">
            <VAvatar
              :size="44"
              rounded
              color="primary"
              variant="tonal"
            >
              <VIcon
                size="22"
                icon="mdi-account-outline"
              />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                {{ props.userData.bs === 'B' ? '형제' : '자매' }}
              </h6>
              <span class="text-sm text-medium-emphasis">B/S</span>
            </div>
          </div>

          <div class="d-flex align-center gap-3">
            <VAvatar
              :size="44"
              rounded
              :color="resolveGroupVariant(props.userData.serviceGroup)"
              variant="tonal"
            >
              <VIcon
                size="22"
                icon="mdi-account-group-outline"
              />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                {{ props.userData.serviceGroup }}
              </h6>
              <span class="text-sm text-medium-emphasis">소속</span>
            </div>
          </div>
        </VCardText>

        <!-- 상세 정보 -->
        <VCardText>
          <h6 class="text-h6">
            교사 정보
          </h6>
          <VDivider class="mt-4 mb-2" />

          <VList class="card-list">
            <VListItem>
              <VListItemTitle>
                <span class="text-sm font-weight-medium">연락처: </span>
                <a
                  :href="`tel:${props.userData.contact}`"
                  class="text-body-2"
                >{{ props.userData.contact }}</a>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <span class="text-sm font-weight-medium">직분: </span>
                <span class="text-body-2">{{ props.userData.position }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem v-if="props.userData.assignedClass">
              <VListItemTitle>
                <span class="text-sm font-weight-medium">담당: </span>
                <span class="text-body-2">{{ props.userData.assignedClass }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem v-if="props.userData.extraRole">
              <VListItemTitle>
                <span class="text-sm font-weight-medium">부가역할: </span>
                <span class="text-body-2">{{ props.userData.extraRole }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem v-if="props.userData.occupation">
              <VListItemTitle>
                <span class="text-sm font-weight-medium">직업: </span>
                <span class="text-body-2">{{ props.userData.occupation }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <span class="text-sm font-weight-medium">구원생일: </span>
                <span class="text-body-2">{{ props.userData.salvationBirthday || '-' }}</span>
              </VListItemTitle>
            </VListItem>
          </VList>
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

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.75rem;
}
</style>
