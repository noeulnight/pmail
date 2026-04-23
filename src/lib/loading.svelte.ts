import { untrack } from 'svelte'

class AppLoadingState {
  pending = $state(0)

  start() {
    this.pending += 1

    let finished = false

    return () => {
      if (finished) return
      finished = true
      this.pending = Math.max(0, this.pending - 1)
    }
  }
}

export const appLoading = new AppLoadingState()

export async function trackAppLoading<T>(work: () => Promise<T>): Promise<T> {
  const done = untrack(() => appLoading.start())

  try {
    return await work()
  } finally {
    untrack(() => done())
  }
}
