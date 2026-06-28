import '@testing-library/jest-dom/vitest'

const reactActGlobal = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true
