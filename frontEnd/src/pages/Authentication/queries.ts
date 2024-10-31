import { seller, user } from 'utils/apiUrls';
import http from 'utils/http';
import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import { TApiResponse } from 'utils/apiResponse.type';
import { UseQueryOptions } from '@tanstack/react-query/build/modern';


export interface IUser {
    id?: string;
    first_name: string,
    last_name: string,
    email: string,
    provider: OauthAuthenticationType,
    stytch_id: string,
    description?: string,
    profile_image_url?: string,
    phone_number?: string,
    location?: string,
    oauth_id: string,
}

export interface ISellerProfile {
    id?: string;
    seller_id: string;
    total_transactions: number;
    average_rating: number;
}

export enum OauthAuthenticationType {
    OAUTH_AUTHENTICATION_TYPE_MICROSOFT = 'OAUTH_AUTHENTICATION_TYPE_MICROSOFT',
}

export interface ICreateUserResponse {
    id: string;
}

export function useCreateUser(
  options?: UseMutationOptions<TApiResponse<IUser>, Error, IUser>,
) {
  return useMutation<TApiResponse<IUser>, Error, IUser>(
    {
      mutationFn: (newUser) => http.post(user.create, newUser),
      ...options,
    },
  );
}

export const userQueryKey = (userId: string) => ['user', userId];

export function useGetUser(
  userId: string,
  options?: UseQueryOptions<TApiResponse<IUser>, Error>,
) {
  return useQuery<TApiResponse<IUser>, Error>(
    {
      queryKey: userQueryKey(userId),
      queryFn: () => http.get(user.details(userId)),
    },
  );
}

export const sellerQueryKey = (sellerId: string) => ['user', 'seller', sellerId];

export function useGetSellerProfile(
  sellerId: string,
  options?: UseQueryOptions<TApiResponse<ISellerProfile>, Error>,
) {
  return useQuery<TApiResponse<ISellerProfile>, Error>(
    {
      queryKey: sellerQueryKey(sellerId),
      queryFn: () => http.get(seller.details(sellerId)),
    },
  );
}

export function useUpdateUser(
  userId: string,
  options?: UseMutationOptions<TApiResponse<IUser>, Error, IUser>,
) {
  return useMutation<TApiResponse<IUser>, Error, IUser>(
    {
      mutationFn: (newUser) => http.put(user.details(userId), newUser),
      ...options,
    },
  );
}
