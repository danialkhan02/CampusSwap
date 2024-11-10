import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import { seller } from 'utils/apiUrls';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';


export interface IReview {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    avatarUrl: string;
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
