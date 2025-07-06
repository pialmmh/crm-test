import { Edit2, Plus, Search, Trash2, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const PACKAGE_PAGE_SIZE = 8;
const BASE_URL = 'http://localhost:3001';

export const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageModalMode, setPackageModalMode] = useState('new');
  const [packageForm, setPackageForm] = useState({
    id: null,
    name: '',
    description: '',
    speed_mbps: '',
    validity_days: '',
    price: '',
    is_active: true,
  });
  const [packagePage, setPackagePage] = useState(1);
  const [packageTotal, setPackageTotal] = useState(0);
  const [packageLoading, setPackageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setPackageLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/packages`);
      const data = await response.json();
      setPackages(data.packages || []);
      setPackageTotal((data.packages || []).length);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages. Please try again.');
    } finally {
      setPackageLoading(false);
    }
  };

  // Filter packages based on search term
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.speed_mbps.toString().includes(searchTerm)
  );

  const paginatedPackages = filteredPackages.slice(
    (packagePage - 1) * PACKAGE_PAGE_SIZE,
    packagePage * PACKAGE_PAGE_SIZE
  );
  const packagePages = Math.ceil(filteredPackages.length / PACKAGE_PAGE_SIZE);

  const openNewPackageModal = () => {
    setPackageForm({
      id: null,
      name: '',
      description: '',
      speed_mbps: '',
      validity_days: '',
      price: '',
      is_active: true,
    });
    setPackageModalMode('new');
    setPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg) => {
    setPackageForm({ ...pkg });
    setPackageModalMode('edit');
    setPackageModalOpen(true);
  };

  const closePackageModal = () => setPackageModalOpen(false);

  const handlePackageFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPackageForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();

    // Show loading toast
    const loadingToast = toast.loading(
      packageModalMode === 'new' ? 'Creating package...' : 'Updating package...'
    );

    try {
      const formData = {
        name: packageForm.name,
        description: packageForm.description,
        speed_mbps: parseInt(packageForm.speed_mbps),
        validity_days: parseInt(packageForm.validity_days),
        price: parseFloat(packageForm.price),
        is_active: packageForm.is_active,
      };

      let response;
      if (packageModalMode === 'new') {
        response = await fetch(`${BASE_URL}/packages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${BASE_URL}/packages/${packageForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating/updating package:', errorData);
        toast.error(errorData.error || 'Failed to save package', {
          id: loadingToast,
        });
        return;
      }

      // Success toast
      toast.success(
        packageModalMode === 'new'
          ? '📦 Package created successfully!'
          : '✅ Package updated successfully!',
        {
          id: loadingToast,
        }
      );

      closePackageModal();
      fetchPackages();
    } catch (error) {
      console.error('Error in handlePackageSubmit:', error);
      toast.error('❌ An error occurred while saving package', {
        id: loadingToast,
      });
    }
  };

  const handleDeletePackage = async (id, packageName) => {
    // Custom confirmation with better UX
    const confirmed = window.confirm(
      `Are you sure you want to delete "${packageName}"?\\n\\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    // Show loading toast
    const loadingToast = toast.loading('Deleting package...');

    try {
      const response = await fetch(`${BASE_URL}/packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting package:', errorData);
        toast.error(errorData.error || 'Failed to delete package', {
          id: loadingToast,
        });
        return;
      }

      // Success toast
      toast.success('🗑️ Package deleted successfully!', {
        id: loadingToast,
      });

      fetchPackages();
    } catch (error) {
      console.error('Error in handleDeletePackage:', error);
      toast.error('❌ An error occurred while deleting package', {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISP Packages</h1>
            <p className="text-gray-600">Manage BTCL internet packages</p>
          </div>
        </div>
        <button
          onClick={openNewPackageModal}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packageTotal}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Packages</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter((p) => p.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Speed</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.length > 0
                  ? Math.round(
                      packages.reduce((sum, p) => sum + p.speed_mbps, 0) /
                        packages.length
                    )
                  : 0}{' '}
                Mbps
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.length > 0
                  ? formatPrice(
                      packages.reduce((sum, p) => sum + p.price, 0) /
                        packages.length
                    )
                  : formatPrice(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {packageLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditPackageModal(pkg)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Package"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {pkg.description}
                    </p>

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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-bold text-purple-600">
                          {formatPrice(pkg.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pkg.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">ID: {pkg.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(packagePage - 1) * PACKAGE_PAGE_SIZE + 1} to{' '}
              {Math.min(
                packagePage * PACKAGE_PAGE_SIZE,
                filteredPackages.length
              )}{' '}
              of {filteredPackages.length} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={packagePage === 1}
                onClick={() => setPackagePage(packagePage - 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                {packagePage} of {packagePages || 1}
              </span>
              <button
                disabled={packagePage === packagePages || packagePages === 0}
                onClick={() => setPackagePage(packagePage + 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {packageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {packageModalMode === 'new'
                  ? 'Add New Package'
                  : 'Edit Package'}
              </h2>
              <button
                onClick={closePackageModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePackageSubmit} className="space-y-6">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  name="name"
                  value={packageForm.name}
                  onChange={handlePackageFormChange}
                  placeholder="Enter package name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={packageForm.description}
                  onChange={handlePackageFormChange}
                  placeholder="Enter package description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Speed and Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Speed (Mbps) *
                  </label>
                  <input
                    name="speed_mbps"
                    type="number"
                    value={packageForm.speed_mbps}
                    onChange={handlePackageFormChange}
                    placeholder="Enter speed in Mbps"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Validity (Days) *
                  </label>
                  <input
                    name="validity_days"
                    type="number"
                    value={packageForm.validity_days}
                    onChange={handlePackageFormChange}
                    placeholder="Enter validity in days"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Price and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (BDT) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={packageForm.price}
                    onChange={handlePackageFormChange}
                    placeholder="Enter price in BDT"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-2 mt-3">
                    <input
                      name="is_active"
                      type="checkbox"
                      checked={packageForm.is_active}
                      onChange={handlePackageFormChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      Active Package
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={closePackageModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  {packageModalMode === 'new'
                    ? 'Create Package'
                    : 'Update Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
