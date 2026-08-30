<script setup>
import AttendanceStatsRow from '@/views/apps/user/AttendanceStatsRow.vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const infoItems = computed(() => [
  { label: '연락처', icon: 'mdi-phone-outline', value: props.userData.contact, href: `tel:${props.userData.contact}` },
  { label: 'B/S', icon: 'mdi-water-outline', value: props.userData.bs === 'B' ? '형제' : '자매' },
  { label: '소속', icon: 'mdi-account-multiple-outline', value: props.userData.serviceGroup },
  { label: '직업', icon: 'mdi-briefcase-outline', value: props.userData.occupation },
  { label: '구원생일', icon: 'mdi-cake-variant-outline', value: props.userData.salvationBirthday },
])
</script>

<template>
  <VRow>
    <!-- 개인 정보 -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h6 class="text-h6">
            개인 정보
          </h6>
          <VDivider class="mt-4 mb-4" />
          <VRow>
            <VCol
              v-for="item in infoItems"
              :key="item.label"
              cols="12"
              sm="6"
              md="4"
            >
              <div class="d-flex align-center gap-3">
                <VAvatar
                  rounded
                  color="primary"
                  variant="tonal"
                  size="42"
                >
                  <VIcon :icon="item.icon" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    {{ item.label }}
                  </p>
                  <a
                    v-if="item.href"
                    :href="item.href"
                    class="text-sm font-weight-medium"
                  >
                    {{ item.value }}
                  </a>
                  <p
                    v-else
                    class="text-sm font-weight-medium mb-0"
                  >
                    {{ item.value || '-' }}
                  </p>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 출석 통계 -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h6 class="text-h6">
            출석 통계
          </h6>
          <VDivider class="mt-4 mb-4" />
          <AttendanceStatsRow :user-id="props.userData.id" />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
