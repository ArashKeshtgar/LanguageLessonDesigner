// Port of unit.py's SK dict — one fixed color per skill, same across every lesson.
export interface SkillMeta {
  color: string
  tint: string
  label: string
  labelFa: string
}

export const SK: Record<string, SkillMeta> = {
  G: { color: '#2D5F86', tint: '#E8F0F7', label: 'Grammar', labelFa: 'گرامر' },
  C: { color: '#2E6B4A', tint: '#E6F1EA', label: 'Collocations', labelFa: 'کالوکیشن' },
  W: { color: '#9A7414', tint: '#FBEFC4', label: 'Word Skills', labelFa: 'واژه' },
  L: { color: '#6B4E8C', tint: '#EFEAF5', label: 'Listening', labelFa: 'شنیدن' },
  P: { color: '#B4534E', tint: '#F7E9E8', label: 'Production', labelFa: 'تولید' },
  S: { color: '#8C5A2B', tint: '#F4ECE3', label: 'Story', labelFa: 'داستان' },
  X: { color: '#1F6F6B', tint: '#E2F0EF', label: 'Certification', labelFa: 'مدرک' },
}
