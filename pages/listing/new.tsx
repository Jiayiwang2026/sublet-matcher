import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import Head from 'next/head';

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  deposit: number;
  startDate: string;
  endDate: string;
  location: string;
  images: string;
  furnished: boolean;
  roomType: string;
}

const roomTypes = [
  { value: 'studio', label: '单间公寓' },
  { value: '1b1b', label: '一室一卫' },
  { value: '2b1b', label: '两室一卫' },
  { value: 'shared', label: '合租房间' },
];

const NewListingPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ListingFormData>({
    defaultValues: {
      furnished: false,
      roomType: 'studio',
    },
  });

  // Watch dates for validation
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const onSubmit = async (data: ListingFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Convert images string to array
      const imageUrls = data.images
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const response = await fetch('/api/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images: imageUrls,
          price: Number(data.price),
          deposit: Number(data.deposit),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '创建房源失败');
      }

      // Redirect to the new listing page
      router.push(`/listing/${result.listing._id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '创建房源失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <>
      <Head>
        <title>发布新房源 - Sublet Matcher</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">发布新房源</h1>
          <p className="mt-2 text-sm text-gray-600">
            请填写以下信息来发布您的房源
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: '请输入标题' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  描述
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { required: '请输入描述' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Price and Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    月租金 (¥)
                  </label>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    {...register('price', {
                      required: '请输入租金',
                      min: { value: 0, message: '租金不能为负数' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                    押金 (¥)
                  </label>
                  <input
                    type="number"
                    id="deposit"
                    min="0"
                    step="0.01"
                    {...register('deposit', {
                      required: '请输入押金',
                      min: { value: 0, message: '押金不能为负数' },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.deposit && (
                    <p className="mt-1 text-sm text-red-600">{errors.deposit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    开始日期
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    {...register('startDate', {
                      required: '请选择开始日期',
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    结束日期
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    {...register('endDate', {
                      required: '请选择结束日期',
                      validate: value =>
                        !startDate || new Date(value) > new Date(startDate) || '结束日期必须晚于开始日期',
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  地理位置
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location', { required: '请输入地理位置' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Images */}
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  图片链接 (多个链接请用逗号分隔)
                </label>
                <input
                  type="text"
                  id="images"
                  {...register('images')}
                  placeholder="http://example.com/image1.jpg, http://example.com/image2.jpg"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
                )}
              </div>

              {/* Room Type */}
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                  房间类型
                </label>
                <select
                  id="roomType"
                  {...register('roomType', { required: '请选择房间类型' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {roomTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.roomType && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomType.message}</p>
                )}
              </div>

              {/* Furnished */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="furnished"
                  {...register('furnished')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="furnished" className="ml-2 block text-sm text-gray-700">
                  配备家具
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            {submitError && (
              <p className="mr-4 text-sm text-red-600 self-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? '发布中...' : '发布房源'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewListingPage; 