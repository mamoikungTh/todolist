import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ThemeCustomizer from '../src/components/theme/ThemeCustomizer.vue'

const style = () => document.documentElement.style

describe('Student 3: theme and fonts', () => {
  it('changes color immediately and restores it on a new mount', async () => {
    const panel = mount(ThemeCustomizer)
    await panel.get('[aria-label="ม่วง (Purple)"]').trigger('click')
    expect(style().getPropertyValue('--primary-color')).toBe('#7c3aed')
    expect(localStorage.getItem('student3_theme_color')).toBe('#7c3aed')
    panel.unmount()
    const restored = mount(ThemeCustomizer)
    await nextTick()
    expect(restored.get('[aria-label="ม่วง (Purple)"]').attributes('aria-pressed')).toBe('true')
  })
  it('changes and persists the selected font', async () => {
    const panel = mount(ThemeCustomizer)
    await panel.findAll('.font-btn')[1].trigger('click')
    expect(style().getPropertyValue('--app-font')).toBe("'Prompt', sans-serif")
    panel.unmount()
    const restored = mount(ThemeCustomizer)
    await nextTick()
    expect(restored.findAll('.font-btn')[1].attributes('aria-pressed')).toBe('true')
  })
  it('persists the Hello World font size and restores all defaults', async () => {
    const panel = mount(ThemeCustomizer)
    await panel.get('input[type="range"]').setValue('40')
    await panel.get('[aria-label="เขียว (Emerald)"]').trigger('click')
    expect(localStorage.getItem('student3_theme_size')).toBe('40')
    panel.unmount()
    const restored = mount(ThemeCustomizer)
    await nextTick()
    expect(restored.get('input[type="range"]').element.value).toBe('40')
    await restored.get('.btn-reset').trigger('click')
    expect(style().getPropertyValue('--primary-color')).toBe('#2563eb')
    expect(style().getPropertyValue('--app-font')).toBe("'Sarabun', sans-serif")
    expect(localStorage.getItem('student3_theme_size')).toBe('28')
  })
  it('uses dark button text on a light custom color', async () => {
    const panel = mount(ThemeCustomizer)
    await panel.get('input[type="color"]').setValue('#ffffff')
    expect(style().getPropertyValue('--primary-contrast')).toBe('#000000')
  })
  it('ignores invalid saved settings', () => {
    localStorage.setItem('student3_theme_color', 'bad')
    localStorage.setItem('student3_theme_font', 'unexpected')
    localStorage.setItem('student3_theme_size', '999')
    const panel = mount(ThemeCustomizer)
    expect(style().getPropertyValue('--primary-color')).toBe('#2563eb')
    expect(style().getPropertyValue('--app-font')).toBe("'Sarabun', sans-serif")
    expect(panel.get('input[type="range"]').element.value).toBe('28')
  })
  it('still changes theme when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    const panel = mount(ThemeCustomizer)
    await nextTick()
    expect(panel.find('[role="alert"]').exists()).toBe(true)
    await panel.get('[aria-label="ม่วง (Purple)"]').trigger('click')
    expect(style().getPropertyValue('--primary-color')).toBe('#7c3aed')
    expect(panel.get('[role="alert"]').text()).toContain('บันทึก')
  })
})
