import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const NewListing = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      deposit: '',
      startDate: '',
      endDate: '',
      location: '',
      furnished: false,
      roomType: 'entire',
    },
  });

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '创建房源失败');
      }

      toast.success('房源创建成功！');
      router.push(`/listing/${result.listing._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '创建房源失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>发布新房源 - Sublet Matcher</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* Left column - Form header */}
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">发布新房源</h3>
              <p className="mt-1 text-sm text-gray-600">
                请填写以下信息发布您的房源。带 * 的为必填项。
              </p>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title', {
                        required: '请输入标题',
                        minLength: {
                          value: 5,
                          message: '标题至少5个字符',
                        },
                      })}
                      className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      描述 *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      {...register('description', {
                        required: '请输入描述',
                        minLength: {
                          value: 20,
                          message: '描述至少20个字符',
                        },
                      })}
                      className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Price and Deposit */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        月租 (¥) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        min="0"
                        step="0.01"
                        {...register('price', {
                          required: '请输入月租',
                          min: {
                            value: 0,
                            message: '月租不能为负数',
                          },
                        })}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                        押金 (¥) *
                      </label>
                      <input
                        type="number"
                        id="deposit"
                        min="0"
                        step="0.01"
                        {...register('deposit', {
                          required: '请输入押金',
                          min: {
                            value: 0,
                            message: '押金不能为负数',
                          },
                        })}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      {errors.deposit && (
                        <p className="mt-1 text-sm text-red-600">{errors.deposit.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        起始日期 *
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        {...register('startDate', {
                          required: '请选择起始日期',
                        })}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        结束日期 *
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        {...register('endDate', {
                          required: '请选择结束日期',
                        })}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      地址 *
                    </label>
                    <input
                      type="text"
                      id="location"
                      {...register('location', {
                        required: '请输入地址',
                      })}
                      className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Room Type */}
                  <div>
                    <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                      房型 *
                    </label>
                    <select
                      id="roomType"
                      {...register('roomType', {
                        required: '请选择房型',
                      })}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="entire">整租</option>
                      <option value="shared">合租</option>
                    </select>
                    {errors.roomType && (
                      <p className="mt-1 text-sm text-red-600">{errors.roomType.message}</p>
                    )}
                  </div>

                  {/* Furnished */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="furnished"
                        type="checkbox"
                        {...register('furnished')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="furnished" className="font-medium text-gray-700">
                        配备家具
                      </label>
                      <p className="text-gray-500">房间是否配备基本家具</p>
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? '发布中...' : '发布房源'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewListing;
