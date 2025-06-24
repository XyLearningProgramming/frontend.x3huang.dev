import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      formatDate: (dateStr: any) => (dateStr ? Intl.DateTimeFormat('us-EN', { dateStyle: 'full' }).format(new Date(dateStr)) : undefined)
    }
  };
});
