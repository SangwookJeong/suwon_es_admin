<script setup>
import { useUserListStore } from '@/views/apps/user/useUserListStore'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const userListStore = useUserListStore()

// 출석 통계
const monthly = ref({ total: 0, present: 0, rate: 0, label: '' })
const quarterly = ref({ total: 0, present: 0, rate: 0, label: '' })
const yearly = ref({ total: 0, present: 0, rate: 0, label: '' })

userListStore.fetchUserAttendanceStats(props.userData.id).then(response => {
  const data = response.data

  monthly.value = data.monthly
  quarterly.value = data.quarterly
  yearly.value = data.yearly
})

const rateColor = rate => {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
}
</script>

<template>
  <VRow>
    <!-- 개인 정보 -->
    <VCol
      cols="12"
      md="7"
    >
      <VCard class="h-100">
        <VCardText>
          <h6 class="text-h6">
            개인 정보
          </h6>
          <VDivider class="mt-4 mb-4" />
          <VRow>
            <!-- 연락처 -->
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
                    {{ props.userData.bs === 'B' ? '형제' : '자매' }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 소속 -->
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
                  <VIcon icon="mdi-account-multiple-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    소속
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.serviceGroup }}
                  </p>
                </div>
              </div>
            </VCol>

            <!-- 직업 -->
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
                  <VIcon icon="mdi-briefcase-outline" />
                </VAvatar>
                <div>
                  <p class="text-xs text-medium-emphasis mb-0">
                    직업
                  </p>
                  <p class="text-sm font-weight-medium mb-0">
                    {{ props.userData.occupation || '-' }}
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
                  color="primary"
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
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 출석 통계 -->
    <VCol
      cols="12"
      md="5"
    >
      <VCard class="h-100">
        <VCardText>
          <h6 class="text-h6">
            출석 통계
          </h6>
          <VDivider class="mt-4 mb-4" />
          <div class="d-flex flex-column gap-5">
          <!-- 월간 -->
          <div class="d-flex align-center gap-4">
            <VProgressCircular
              :model-value="monthly.rate"
              :size="56"
              :width="6"
              :color="rateColor(monthly.rate)"
            >
              <span class="text-body-1 font-weight-bold">{{ monthly.rate }}%</span>
            </VProgressCircular>
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-sm font-weight-medium">월간 출석률</span>
                <span class="text-xs text-medium-emphasis">{{ monthly.label }}</span>
              </div>
              <span class="text-xs text-medium-emphasis">
                {{ monthly.present }}/{{ monthly.total }}회 출석
              </span>
            </div>
          </div>

          <VDivider />

          <!-- 분기 -->
          <div class="d-flex align-center gap-4">
            <VProgressCircular
              :model-value="quarterly.rate"
              :size="56"
              :width="6"
              :color="rateColor(quarterly.rate)"
            >
              <span class="text-body-1 font-weight-bold">{{ quarterly.rate }}%</span>
            </VProgressCircular>
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-sm font-weight-medium">분기 출석률</span>
                <span class="text-xs text-medium-emphasis">{{ quarterly.label }}</span>
              </div>
              <span class="text-xs text-medium-emphasis">
                {{ quarterly.present }}/{{ quarterly.total }}회 출석
              </span>
            </div>
          </div>

          <VDivider />

          <!-- 연간 -->
          <div class="d-flex align-center gap-4">
            <VProgressCircular
              :model-value="yearly.rate"
              :size="56"
              :width="6"
              :color="rateColor(yearly.rate)"
            >
              <span class="text-body-1 font-weight-bold">{{ yearly.rate }}%</span>
            </VProgressCircular>
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-sm font-weight-medium">연간 출석률</span>
                <span class="text-xs text-medium-emphasis">{{ yearly.label }}</span>
              </div>
              <span class="text-xs text-medium-emphasis">
                {{ yearly.present }}/{{ yearly.total }}회 출석
              </span>
            </div>
          </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
