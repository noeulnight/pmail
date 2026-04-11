import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    rolldownOptions: {
      checks: {
        pluginTimings: false
      },
      onwarn(warning, defaultHandler) {
        const message = typeof warning === 'string' ? warning : warning.message

        if (
          message.includes(
            'contains an annotation that Rollup cannot interpret due to the position of the comment'
          )
        ) {
          return
        }

        defaultHandler(warning)
      }
    }
  }
})
