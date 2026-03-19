import * as z from 'zod'
import { useI18n } from 'vue-i18n'

export function useEventInfoForm() {
  const { t } = useI18n()
  const TITLE_MAX = 200

  const schema = z.object({
    title:              z.string().min(1, { message: t('events.stepper.info.error.title_required') }),
    selectedCategories: z.array(z.number()).min(1, { message: t('events.stepper.info.error.categories_required') }),
    files:              z.array(z.instanceof(File)).min(1, { message: t('events.stepper.info.error.upload_required') }),
  })

  const titleLength    = (title: string) => title.length
  const titleNearLimit = (title: string) => title.length > TITLE_MAX * 0.8

  return { schema, TITLE_MAX, titleLength, titleNearLimit }
}
