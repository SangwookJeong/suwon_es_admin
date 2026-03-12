<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

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
</script>

<template>
  <VRow>
    <!-- 부서 & 역할 정보 -->
    <VCol cols="12">
      <VCard title="부서 & 역할 정보">
        <VDivider />
        <VCardText>
          <VRow>
            <!-- 부서 -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  :color="resolveDeptVariant(props.userData.department).color"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-account-group-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    부서
                  </p>
                  <VChip
                    :color="resolveDeptVariant(props.userData.department).color"
                    size="small"
                    class="mt-1"
                  >
                    {{ props.userData.department }}
                  </VChip>
                </div>
              </div>
            </VCol>

            <!-- 직분 -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="secondary"
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

            <!-- 담당분반 -->
            <VCol
              v-if="props.userData.assignedClass"
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="success"
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
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="warning"
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
      </VCard>
    </VCol>

    <!-- 개인 정보 -->
    <VCol cols="12">
      <VCard title="개인 정보">
        <VDivider />
        <VCardText>
          <VRow>
            <!-- 소속 -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  :color="resolveGroupVariant(props.userData.serviceGroup)"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-account-multiple-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    소속
                  </p>
                  <VChip
                    :color="resolveGroupVariant(props.userData.serviceGroup)"
                    size="small"
                    class="mt-1"
                  >
                    {{ props.userData.serviceGroup }}
                  </VChip>
                </div>
              </div>
            </VCol>

            <!-- B/S -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="primary"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-water-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    B/S
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.bs === 'B' ? '형제 (B)' : '자매 (S)' }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 직업 -->
            <VCol
              v-if="props.userData.occupation"
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="info"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-briefcase-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    직업
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.occupation }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 구원생일 -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="error"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-cake-variant-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    구원생일
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.salvationBirthday || '-' }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 연락처 -->
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center gap-3 mb-4">
                <VAvatar
                  rounded
                  color="secondary"
                  variant="tonal"
                  size="42"
                >
                  <VIcon icon="mdi-phone-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    연락처
                  </p>
                  <a
                    :href="`tel:${props.userData.contact}`"
                    class="text-sm font-weight-medium"
                  >
                    {{ props.userData.contact }}
                  </a>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
