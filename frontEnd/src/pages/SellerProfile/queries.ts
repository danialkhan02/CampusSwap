import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import { seller } from 'utils/apiUrls';
import {
  useMutation, UseMutationOptions, useQuery, UseQueryOptions,
} from '@tanstack/react-query';
import { IUser } from 'pages/Authentication/queries';


export interface IReview {
    id?: string;
    userName: string;
    rating: number;
    timestamp?: string;
    avatarUrl?: string;
    buyer_id: string;
    seller_id: string;
    seller?: IUser;
    buyer?: IUser;
    verified_purchase: boolean;
    feedback_message: string;
}

export const sellerReviewQueryKey = (sellerId: string) => ['seller', 'review', sellerId];

export function useGetSellerReviews(
  sellerId: string,
  options?: UseQueryOptions<TApiResponse<IReview[]>, Error>,
) {
  return useQuery<TApiResponse<IReview[]>, Error>(
    {
      queryKey: sellerReviewQueryKey(sellerId),
      queryFn: () => http.get(seller.review(sellerId)),
      retry: false,
      ...options,
    },
  );
}

export function useCreateSellerFeedback(
  options?: UseMutationOptions<TApiResponse<IReview>, Error, IReview>,
) {
  return useMutation<TApiResponse<IReview>, Error, IReview>(
    {
      mutationFn: (newReview) => http.post(seller.create, newReview),
      ...options,
    },
  );
}
