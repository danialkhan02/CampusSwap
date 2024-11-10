import ListingModalBase from 'pages/UserProfile/components/ListingModalBase';
import {
  IProduct,
  listerProductListQueryKey,
  productDetailsQueryKey,
  useGenerateProductDescription,
  useGetProductDetails,
  useUpdateProduct,
} from 'pages/HomePage/queries';
import { useQueryClient } from '@tanstack/react-query';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useMemo } from 'react';


export default function UpdateListingModal({
  isOpen,
  onClose,
  currentListing,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentListing: IProduct;
}) {
  const queryClient = useQueryClient();
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const updateProductHook = useUpdateProduct(currentListing.id || '');
  const generateDescriptionHook = useGenerateProductDescription();

  const { data: productDetailsData, isLoading } = useGetProductDetails(
    currentListing?.id || '',
    {
      enabled: !!currentListing.id,
      queryKey: productDetailsQueryKey(currentListing.id || ''),
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const initialListing = useMemo(() => {
    if (!productDetailsData?.data) return null;

    // Create a complete listing object with all required fields
    return {
      ...productDetailsData.data,
      id: currentListing.id, // Ensure ID is preserved
      lister_id: currentListing.seller?.id || '',
      images: productDetailsData.data.images || [],
      location: {
        ...productDetailsData.data.location,
        address: productDetailsData.data.location?.address || '',
        latitude: productDetailsData.data.location?.latitude || 0,
        longitude: productDetailsData.data.location?.longitude || 0,
      },
    };
  }, [productDetailsData, currentListing.id, currentListing.seller?.id]);

  const handleSubmit = async (listing: IProduct) => {
    const updatedListing = {
      ...listing,
      id: currentListing.id, // Ensure ID is preserved
    };

    await updateProductHook.mutateAsync(updatedListing);

    // Update the cache immediately with the new data
    queryClient.setQueryData(
      productDetailsQueryKey(currentListing.id || ''),
      { data: updatedListing },
    );

    // Invalidate only the list view
    queryClient.invalidateQueries({
      queryKey: listerProductListQueryKey(userId || '', userId || ''),
      exact: true,
    });
  };

  return (
    <ListingModalBase
      isOpen={isOpen}
      onClose={onClose}
      initialListing={initialListing}
      isLoading={isLoading}
      mode='update'
      onSubmit={handleSubmit}
      title='Edit Listing'
      submitButtonText='Update Listing'
      generateDescription={(params) => generateDescriptionHook.mutateAsync({
        name: params.name,
        images: params.images,
        category: params.category,
        condition: params.condition,
      })}
    />
  );
}
