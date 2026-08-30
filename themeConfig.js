import { breakpointsVuetify } from '@vueuse/core'
import { VIcon } from 'vuetify/components'

import { defineThemeConfig } from '@core'
import { RouteTransitions, Skins } from '@core/enums'
import { AppContentLayoutNav, ContentWidth, FooterType, NavbarType } from '@layouts/enums'

export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: '수원교회 초등부',

    logo: h('img', { src: '/suwon_logo.png', alt: '수원교회 초등부', style: 'height: 36px; object-fit: contain;' }),
    contentWidth: ContentWidth.Boxed,
    contentLayoutNav: AppContentLayoutNav.Vertical,
    overlayNavFromBreakpoint: breakpointsVuetify.md + 16,
    enableI18n: true,
    theme: 'light',
    isRtl: false,
    skin: Skins.Default,
    routeTransition: RouteTransitions.Fade,
    iconRenderer: VIcon,
  },
  navbar: {
    // ℹ️ Static: 휠을 내리면 툴바도 본문과 같이 위로 올라갑니다 (Sticky 처럼 따라붙지 않음)
    type: NavbarType.Static,
    navbarBlur: false,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'mdi-circle-outline' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
  },
  icons: {
    chevronDown: { icon: 'mdi-chevron-down' },
    chevronRight: { icon: 'mdi-chevron-right' },
    close: { icon: 'mdi-close' },
    verticalNavPinned: { icon: 'mdi-chevron-double-left' },
    verticalNavUnPinned: { icon: 'mdi-chevron-double-right' },
    sectionTitlePlaceholder: { icon: 'mdi-minus' },
  },
})
