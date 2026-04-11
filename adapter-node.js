import adapter from '@sveltejs/adapter-node'

const rollupAnnotationWarning =
  'contains an annotation that Rollup cannot interpret due to the position of the comment'

export default function (opts = {}) {
  const base = adapter(opts)

  return {
    ...base,
    async adapt(builder) {
      const originalWrite = process.stderr.write.bind(process.stderr)

      process.stderr.write = (chunk, encoding, callback) => {
        const text = typeof chunk === 'string' ? chunk : chunk.toString()

        if (
          text.includes(rollupAnnotationWarning) ||
          text.includes('Wraps a cipher: validates args')
        ) {
          if (typeof encoding === 'function') encoding()
          if (typeof callback === 'function') callback()
          return true
        }

        return originalWrite(
          chunk,
          typeof encoding === 'function' ? undefined : encoding,
          typeof encoding === 'function' ? encoding : callback
        )
      }

      try {
        await base.adapt(builder)
      } finally {
        process.stderr.write = originalWrite
      }
    }
  }
}
