import { IUser } from 'pages/Authentication/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import {
  useMutation, UseMutationOptions, useQuery, UseQueryOptions,
} from '@tanstack/react-query';
import { product } from 'utils/apiUrls';
import { ECategory, ECondition, ESort } from 'pages/HomePage/constants';
import { IFilters } from 'pages/HomePage/components/ProductList';


export interface IProduct {
    id?: string;
    name: string;
    title: string;
    price: number;
    images: string[];
    category: ECategory;
    condition?: ECondition;
    description: string;
    lister_id?: string;
    seller?: IUser;
    interested_buyers?: IUser[];
    location: ILocation;
    interested?: boolean;
}

export interface ILocation {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface IGenerateDescription {
    category: ECategory,
    condition: ECondition,
    name: string,
    images: string[],
}

export interface ProductListResponse {
    items: IProduct[],
    total: number,
    page: number,
    limit: number,
}

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

export const convertFiltersToQueryParams = (
  filters?: IFilters,
  sort?: ESort | null,
  page?: number,
  limit?: number,
): IProductListQueryParams => {
  let finalParams: IProductListQueryParams = {
    page: 1,
    limit: 20,
  };

  if (page) {
    finalParams.page = page;
  }

  if (limit) {
    finalParams.limit = limit;
  }

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

export const productDetailsQueryKey = (productId: string) => ['product', 'details', productId];

export function useGetProductDetails(
  productId: string,
  options?: UseQueryOptions<TApiResponse<IProduct>, Error>,
) {
  return useQuery<TApiResponse<IProduct>, Error>(
    {
      queryKey: productDetailsQueryKey(productId),
      queryFn: () => http.get(product.details(productId)),
      retry: false,
      ...options,
    },
  );
}

export const productListQueryKey = (userId: string) => ['product', 'list', userId];

export function useGetProductList(
  userId: string,
  filters: IProductListQueryParams,
  options?: UseQueryOptions<TApiResponse<ProductListResponse>, Error>,
) {
  return useQuery<TApiResponse<ProductListResponse>, Error>(
    {
      queryKey: productListQueryKey(userId),
      queryFn: () => http.get(`${product.list(userId)}?${buildQueryString(filters).toString()}`),
      retry: false,
      ...options,
    },
  );
}

export function useCreateProduct(
  options?: UseMutationOptions<TApiResponse<IProduct>, Error, IProduct>,
) {
  return useMutation<TApiResponse<IProduct>, Error, IProduct>(
    {
      mutationFn: (newProduct) => http.post(product.create, newProduct),
      ...options,
    },
  );
}

export function useAddWatchlist(
  productId: string,
  buyerId: string,
  options?: UseMutationOptions<TApiResponse<null>, Error, void>,
) {
  return useMutation<TApiResponse<null>, Error, void>(
    {
      mutationFn: () => http.post(product
        .addInterest(productId, buyerId), {}),
      ...options,
    },
  );
}

export const listerProductListQueryKey = (listerId: string, userId: string) => ['product', 'lister', 'list', listerId, userId];

export function useGetListerProductList(
  listerId: string,
  userId: string,
  filters: IProductListQueryParams,
  options?: UseQueryOptions<TApiResponse<ProductListResponse>, Error>,
) {
  return useQuery<TApiResponse<ProductListResponse>, Error>(
    {
      queryKey: listerProductListQueryKey(listerId, userId),
      queryFn: () => http.get(`${product.byLister(listerId, userId)}?${buildQueryString(filters).toString()}`),
      retry: false,
      ...options,
    },
  );
}

export function useUpdateProduct(
  productId: string,
  options?: UseMutationOptions<TApiResponse<IProduct>, Error, IProduct>,
) {
  return useMutation<TApiResponse<IProduct>, Error, IProduct>(
    {
      mutationFn: (newProduct) => http.put(product.details(productId), newProduct),
      ...options,
    },
  );
}

export const listerWishListQueryKey = (userId: string) => ['product', 'lister', 'wishlist', userId];

export function useGetListerWishList(
  userId: string,
  filters: IProductListQueryParams,
  options?: UseQueryOptions<TApiResponse<ProductListResponse>, Error>,
) {
  return useQuery<TApiResponse<ProductListResponse>, Error>(
    {
      queryKey: listerWishListQueryKey(userId),
      queryFn: () => http.get(`${product.wishlist(userId)}?${buildQueryString(filters).toString()}`),
      retry: false,
      ...options,
    },
  );
}

export interface IGenerateResponse {
    description: string,
}

export function useGenerateProductDescription(
  options?: UseMutationOptions<TApiResponse<IGenerateResponse>, Error, IGenerateDescription>,
) {
  return useMutation<TApiResponse<IGenerateResponse>, Error, IGenerateDescription>(
    {
      mutationFn: (newProduct) => http.post(product.generate, newProduct),
      ...options,
    },
  );
}

export function useSearchProducts(
  query: string,
  options?: UseQueryOptions<TApiResponse<IProduct[]>, Error>,
) {
  return useQuery<TApiResponse<IProduct[]>, Error>(
    {
      queryKey: ['products', 'search', query],
      queryFn: () => http.get(`${product.search}?query=${encodeURIComponent(query)}`),
      enabled: query.length >= 2,
      ...options,
    },
  );
}
