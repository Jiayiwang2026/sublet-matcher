import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import { Listing } from '../../models/Listing';
import { useAuth } from '../../hooks/useAuth';
import TipButton from '../../components/TipButton';
import { Types } from 'mongoose';

interface ListingDetailProps {
  listing: {
    _id: string;
    title: string;
    description: string;
    price: number;
    deposit: number;
    startDate: string;
    endDate: string;
    location: string;
    images: string[];
    furnished: boolean;
    roomType: string;
    owner: {
      _id: string;
      username: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    await connectToDatabase();

    const listing = await Listing.findById(params?.id).populate('owner', 'username email').lean();

    if (!listing) {
      return {
        notFound: true,
      };
    }

    // Convert dates to strings and _id to string for serialization
    return {
      props: {
        listing: JSON.parse(
          JSON.stringify({
            ...listing,
            _id: listing._id.toString(),
            owner: {
              ...listing.owner,
              _id: (listing.owner as unknown as { _id: Types.ObjectId })._id.toString(),
            },
          })
        ),
      },
    };
  } catch (error) {
    console.error('Listing detail error:', error);
    return {
      notFound: true,
    };
  }
};

const ListingDetailPage = ({ listing }: ListingDetailProps) => {
  const { user } = useAuth();
  const [tipSuccess, setTipSuccess] = useState(false);

  const handleTipSuccess = () => {
    setTipSuccess(true);
    setTimeout(() => setTipSuccess(false), 3000);
  };

  const roomTypeLabels: Record<string, string> = {
    studio: '单间公寓',
    '1b1b': '一室一卫',
    '2b1b': '两室一卫',
    shared: '合租房间',
  };

  return (
    <>
      <Head>
        <title>{listing.title} - Sublet Matcher</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {tipSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
            打赏成功！
          </div>
        )}

        {/* Listing Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                发布于 {new Date(listing.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>

            {/* Tip Button */}
            {user && user.id !== listing.owner._id && (
              <TipButton listingId={listing._id} onSuccess={handleTipSuccess} />
            )}
          </div>
        </div>

        {/* Listing Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {listing.images.length > 0 && (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900">房源描述</h2>
              <p className="mt-4 text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">¥{listing.price}</span>
                <span className="text-gray-500">/月</span>
              </div>
              <p className="text-gray-600">押金：¥{listing.deposit}</p>
            </div>

            {/* Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">房源详情</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">房型</dt>
                  <dd className="mt-1 text-sm text-gray-900">{roomTypeLabels[listing.roomType]}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">地理位置</dt>
                  <dd className="mt-1 text-sm text-gray-900">{listing.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">起租日期</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(listing.startDate).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">结束日期</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(listing.endDate).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">家具配置</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {listing.furnished ? '配备家具' : '无家具'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Owner Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">房东信息</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">房东：</span>
                  {listing.owner.username}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">联系邮箱：</span>
                  {listing.owner.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingDetailPage;
