import { IUser } from 'pages/Authentication/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { product } from 'utils/apiUrls';


export interface IProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    seller: IUser;
    interested_buyers: IUser[];
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
