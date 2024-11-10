import ListingModalBase from 'pages/UserProfile/components/ListingModalBase';
import { useQueryClient } from '@tanstack/react-query';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import {
  IProduct,
  listerProductListQueryKey,
  useCreateProduct,
  useGenerateProductDescription,
} from 'pages/HomePage/queries';
import { ECategory, ECondition } from 'pages/HomePage/constants';


export default function ListingModal({
  isOpen,
  onClose,
}: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const createProductHook = useCreateProduct();
  const generateDescriptionHook = useGenerateProductDescription();

  const handleSubmit = async (listing: IProduct) => {
    await createProductHook.mutateAsync(listing);
    queryClient.invalidateQueries({
      queryKey: listerProductListQueryKey(userId || '', userId || ''),
    });
  };

  return (
    <ListingModalBase
      isOpen={isOpen}
      onClose={onClose}
      mode='create'
      onSubmit={handleSubmit}
      title='Create Listing'
      submitButtonText='Publish Listing'
      generateDescription={(params) => generateDescriptionHook.mutateAsync({
        name: params.name,
        images: params.images,
        category: params.category as ECategory,
        condition: params.condition as ECondition,
      })}
    />
  );
}
