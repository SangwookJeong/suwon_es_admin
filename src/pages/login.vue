<script setup>
import { VForm } from 'vuetify/components'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import axios from '@axios'
import LoginIllustration from '@/views/login/LoginIllustration.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { requiredValidator } from '@validators'
import authV2MaskDark from '@images/pages/auth-v2-mask-dark.png'
import authV2MaskLight from '@images/pages/auth-v2-mask-light.png'

const isPasswordVisible = ref(false)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const route = useRoute()
const router = useRouter()
const ability = useAppAbility()

const refVForm = ref()
const loginId = ref('')
const password = ref('')
const isLoading = ref(false)

const errors = ref({
  loginId: undefined,
  password: undefined,
})

const clearSession = () => {
  localStorage.removeItem('userData')
  localStorage.removeItem('userAbilities')
  localStorage.removeItem('accessToken')
}

const login = async () => {
  isLoading.value = true
  errors.value = { loginId: undefined, password: undefined }

  try {
    // 백엔드는 accounts.email 컬럼으로 계정을 조회합니다.
    // (backend/src/routes/auth.routes.js — POST /auth/login)
    const { data } = await axios.post('/auth/login', {
      email: loginId.value,
      password: password.value,
    })

    localStorage.setItem('userAbilities', JSON.stringify(data.userAbilities))
    localStorage.setItem('userData', JSON.stringify(data.userData))
    localStorage.setItem('accessToken', JSON.stringify(data.accessToken))
    ability.update(data.userAbilities)

    router.replace(route.query.to ? String(route.query.to) : '/')
  }
  catch (error) {
    clearSession()

    errors.value = {
      loginId: error.response?.data?.errors?.email?.[0] || '아이디 또는 비밀번호가 올바르지 않습니다.',
      password: undefined,
    }
    console.error(error)
  }
  finally {
    isLoading.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
</script>

<template>
  <div>
    <!-- Title and Logo -->
    <div class="auth-logo d-flex align-start gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
    </div>

    <VRow
      no-gutters
      class="auth-wrapper"
    >
      <VCol
        lg="8"
        class="d-none d-lg-flex align-center justify-center position-relative"
      >
        <LoginIllustration class="auth-illustration" />
        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </VCol>

      <VCol
        cols="12"
        lg="4"
        class="auth-card-v2 d-flex align-center justify-center"
      >
        <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h5 class="text-h5 mb-1">
              {{ themeConfig.app.title }} 👋🏻
            </h5>
            <p class="mb-0">
              발급받은 아이디와 비밀번호로 로그인하세요
            </p>
          </VCardText>
          <VCardText>
            <VForm
              ref="refVForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- 아이디 -->
                <VCol cols="12">
                  <VTextField
                    v-model="loginId"
                    label="아이디"
                    autocomplete="username"
                    :rules="[requiredValidator]"
                    :error-messages="errors.loginId"
                  />
                </VCol>

                <!-- 비밀번호 -->
                <VCol cols="12">
                  <VTextField
                    v-model="password"
                    label="비밀번호"
                    autocomplete="current-password"
                    :rules="[requiredValidator]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :error-messages="errors.password"
                    :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <VBtn
                    block
                    type="submit"
                    class="mt-6"
                    :loading="isLoading"
                  >
                    로그인
                  </VBtn>
                </VCol>

                <VCol
                  cols="12"
                  class="text-center"
                >
                  <span class="text-disabled text-body-2">
                    계정 발급 및 비밀번호 초기화는 관리자에게 문의하세요
                  </span>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
