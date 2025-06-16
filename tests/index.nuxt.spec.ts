import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '../pages/index.vue'

// dummy test
describe('Main Page', () => {
  it('should display the expected string', () => {
    const wrapper = mount(IndexPage)
    expect(wrapper.text()).toContain('')
  })
})