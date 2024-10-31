import { IUser } from 'pages/Authentication/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import {
  useMutation, UseMutationOptions, useQuery, UseQueryOptions,
} from '@tanstack/react-query';
import { product } from 'utils/apiUrls';
import { ECategory, ECondition } from 'pages/HomePage/constants';


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
}

export interface ILocation {
    latitude: number;
    longitude: number;
    address?: string;
}

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

export const productListQueryKey = () => ['product', 'list'];

export function useGetProductList(
  options?: UseQueryOptions<TApiResponse<IProduct[]>, Error>,
) {
  return useQuery<TApiResponse<IProduct[]>, Error>(
    {
      queryKey: productListQueryKey(),
      queryFn: () => http.get(product.list),
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

export const listerProductListQueryKey = (listerId: string) => ['product', 'lister', 'list', listerId];

export function useGetListerProductList(
  listerId: string,
  options?: UseQueryOptions<TApiResponse<IProduct[]>, Error>,
) {
  return useQuery<TApiResponse<IProduct[]>, Error>(
    {
      queryKey: listerProductListQueryKey(listerId),
      queryFn: () => http.get(product.byLister(listerId)),
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
  options?: UseQueryOptions<TApiResponse<IProduct[]>, Error>,
) {
  return useQuery<TApiResponse<IProduct[]>, Error>(
    {
      queryKey: listerWishListQueryKey(userId),
      queryFn: () => http.get(product.wishlist(userId)),
      retry: false,
      ...options,
    },
  );
}
