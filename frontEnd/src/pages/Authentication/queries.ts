import { user } from 'utils/apiUrls';
import http from 'utils/http';
import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import { TApiResponse } from 'utils/apiResponse.type';


export interface IUser {
    id?: string;
    first_name: string,
    last_name: string,
    email: string,
    provider: OauthAuthenticationType,
    stytch_id: string,
    oauth_id: string,
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

export const userQueryKey = () => ['user'];

export function useGetUser() {
  return useQuery<TApiResponse<IUser>, Error>(
    {
      queryKey: userQueryKey(),
      queryFn: () => http.get(user.details),
    },
  );
}
