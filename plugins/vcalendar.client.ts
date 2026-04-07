/**
 * plugins/vcalendar.client.ts
 * Register v-calendar globally (client-only — avoids SSR hydration issues).
 */
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

export default defineNuxtPlugin((app) => {
  app.vueApp.use(VCalendar, {
    locales: {
      'th-TH-u-ca-buddhist': {
        firstDayOfWeek: 1, // Monday
        masks: {
          title: 'MMMM YYYY',
          weekdays: 'W',
          navMonths: 'MMM',
          input: ['DD/MM/YYYY'],
          dayPopover: 'WWW, MMM D, YYYY',
        },
      },
    },
  })
})
