import { beforeEach, afterEach, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { webcrypto } from 'node:crypto'

Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
enableAutoUnmount(afterEach)
beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
afterEach(() => { vi.restoreAllMocks(); document.documentElement.removeAttribute('style') })
