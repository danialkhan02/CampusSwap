import { IFilters } from 'pages/HomePage/components/ProductList';
import { ECategory, ECondition, ESort } from 'pages/HomePage/constants';


export const convertFiltersToQueryParams = (
  filters?: IFilters,
  sort?: ESort | null,
): IProductListQueryParams => {
  let finalParams: IProductListQueryParams = {
    page: 1,
    limit: 20,
  };

  if (filters) {
    const conditionNew = filters.condition[ECondition.CONDITION_NEW];
    const conditionUsed = filters.condition[ECondition.CONDITION_USED];
    let conditionParam: ECondition | undefined;

    if (conditionNew !== conditionUsed) {
      conditionParam = conditionNew ? ECondition.CONDITION_NEW : ECondition.CONDITION_USED;
    }

    finalParams = {
      ...finalParams,
      category: filters.category ?? undefined,
      condition: conditionParam,
      price_min: filters.price[0],
      price_max: filters.price[1],
      latitude: filters.location.latitude || undefined,
      longitude: filters.location.longitude || undefined,
      radius: filters.location.latitude === 0 ? undefined : filters.radius,
    };
  }

  if (sort) {
    finalParams = {
      ...finalParams,
      sort,
    };
  }

  return finalParams;
};

export const defaultFilters: IFilters = {
  condition: {
    [ECondition.CONDITION_NEW]: false,
    [ECondition.CONDITION_USED]: false,
  },
  location: {
    address: '',
    latitude: 0,
    longitude: 0,
  },
  radius: 250,
  category: null,
  price: [0, 200],
  seller_rating: 0,
};

export interface IProductListQueryParams {
  page: number;
  limit: number;
  category?: ECategory;
  condition?: ECondition;
  price_min?: number;
  price_max?: number;
  sort?: 'price_asc' | 'price_desc' | 'created_at_asc' | 'created_at_desc';
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function buildQueryString(filters: IProductListQueryParams) {
  const queryParams = new URLSearchParams();
  queryParams.set('page', filters.page.toString());
  queryParams.set('limit', filters.limit.toString());

  if (filters.category) {
    queryParams.set('category', filters.category);
  }
  if (filters.condition) {
    queryParams.set('condition', filters.condition);
  }
  if (filters.price_min !== undefined) {
    queryParams.set('price_min', filters.price_min.toString());
  }
  if (filters.price_max !== undefined) {
    queryParams.set('price_max', filters.price_max.toString());
  }
  if (filters.sort) {
    queryParams.set('sort', filters.sort);
  }
  if (filters.latitude !== undefined) {
    queryParams.set('latitude', filters.latitude.toString());
  }
  if (filters.longitude !== undefined) {
    queryParams.set('longitude', filters.longitude.toString());
  }
  if (filters.radius !== undefined) {
    queryParams.set('radius', filters.radius.toString());
  }

  return queryParams;
}
