import {defineStore} from "pinia";
import type {Category} from "~/types/model";
import {useApi} from "~/composables/useApi";

interface GetCategoriesResponse {
  categories: Category[],
  status: 'success' | 'error'
}

interface FilterParam {
  term?: string
  status?: string
}
export const useCategoryStore = defineStore('category', () => {

  const { get } = useApi()
  const getCategories = async (): Promise<Category[]> => {
   const categoriesResponse = await get<GetCategoriesResponse>('/public/categories')
    return categoriesResponse.categories;
  }

  return {
    getCategories,
  }
});
