import { CreditCard, Package, ShoppingCart, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:3003';

export const CustomerPackages = ({ customerId, customerName }) => {
  const [packages, setPackages] = useState([]);
  const [customerPackages, setCustomerPackages] = useState([]);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const fetchCustomerPackages = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/customers/${customerId}/packages`
      );
      const data = await response.json();
      setCustomerPackages(data.customerPackages || []);
    } catch (error) {
      console.error('Error fetching customer packages:', error);
      toast.error('Failed to load customer packages');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesResponse, customerPackagesResponse] = await Promise.all([
          fetch(`${BASE_URL}/packages`),
          fetch(`${BASE_URL}/customers/${customerId}/packages`),
        ]);

        const packagesData = await packagesResponse.json();
        const customerPackagesData = await customerPackagesResponse.json();

        setPackages(packagesData.packages || []);
        setCustomerPackages(customerPackagesData.customerPackages || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [customerId]);

  const openPurchaseModal = (pkg) => {
    setSelectedPackage(pkg);
    setPurchaseForm({
      start_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
    });
    setPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    setPurchaseModalOpen(false);
    setSelectedPackage(null);
  };

  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading('Processing package purchase...');
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/customers/${customerId}/packages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            package_id: selectedPackage.id,
            start_date: purchaseForm.start_date,
            payment_method: purchaseForm.payment_method,
            notes: purchaseForm.notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to purchase package', {
          id: loadingToast,
        });
        return;
      }

      toast.success('🎉 Package purchased successfully!', {
        id: loadingToast,
      });

      closePurchaseModal();
      fetchCustomerPackages();
      setActiveTab('purchased');
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast.error('❌ An error occurred while purchasing package', {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePackageStatus = async (packageId, status) => {
    const loadingToast = toast.loading('Updating package status...');

    try {
      const response = await fetch(
        `${BASE_URL}/customers/${customerId}/packages/${packageId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update package status', {
          id: loadingToast,
        });
        return;
      }

      toast.success('Package status updated successfully!', {
        id: loadingToast,
      });

      fetchCustomerPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
      toast.error('❌ An error occurred while updating package status', {
        id: loadingToast,
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPackageExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Package Management
            </h1>
            <p className="text-gray-600">Manage packages for {customerName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Browse Packages
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'purchased'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Purchased Packages ({customerPackages.length})
        </button>
      </div>

      {/* Browse Packages Tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {formatPrice(pkg.price)}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Speed:</span>
                    <span className="font-semibold text-blue-600">
                      {pkg.speed_mbps} Mbps
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Validity:</span>
                    <span className="font-semibold text-green-600">
                      {pkg.validity_days} days
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openPurchaseModal(pkg)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Purchase Package</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Purchased Packages Tab */}
      {activeTab === 'purchased' && (
        <div className="space-y-6">
          {customerPackages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No packages purchased
              </h3>
              <p className="text-gray-600">
                This customer hasn't purchased any packages yet.
              </p>
            </div>
          ) : (
            customerPackages.map((customerPkg) => (
              <div
                key={customerPkg.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {customerPkg.package_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {customerPkg.package_description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-purple-600">
                      {formatPrice(customerPkg.amount_paid)}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          customerPkg.status
                        )}`}
                      >
                        {customerPkg.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="font-semibold text-blue-600">
                      {customerPkg.speed_mbps} Mbps
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(customerPkg.start_date)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">End Date</p>
                    <p
                      className={`font-semibold ${
                        isPackageExpired(customerPkg.end_date)
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formatDate(customerPkg.end_date)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-gray-900">
                      {customerPkg.payment_method}
                    </p>
                  </div>
                </div>

                {customerPkg.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{customerPkg.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {customerPkg.status === 'active' && (
                    <button
                      onClick={() =>
                        updatePackageStatus(customerPkg.id, 'suspended')
                      }
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                  {customerPkg.status === 'suspended' && (
                    <button
                      onClick={() =>
                        updatePackageStatus(customerPkg.id, 'active')
                      }
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                  {customerPkg.status !== 'expired' && (
                    <button
                      onClick={() =>
                        updatePackageStatus(customerPkg.id, 'expired')
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Mark Expired
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Purchase Modal */}
      {purchaseModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Purchase Package
              </h2>
              <button
                onClick={closePurchaseModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Package Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPackage.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Speed</p>
                  <p className="font-semibold text-blue-600">
                    {selectedPackage.speed_mbps} Mbps
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Validity</p>
                  <p className="font-semibold text-green-600">
                    {selectedPackage.validity_days} days
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold text-purple-600">
                    {formatPrice(selectedPackage.price)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  name="start_date"
                  type="date"
                  value={purchaseForm.start_date}
                  onChange={handlePurchaseFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="payment_method"
                  value={purchaseForm.payment_method}
                  onChange={handlePurchaseFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={purchaseForm.notes}
                  onChange={handlePurchaseFormChange}
                  placeholder="Additional notes (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closePurchaseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
