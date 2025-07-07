import {
  Edit2,
  FileText,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerPackages } from './CustomerPackages';

const PARTNER_PAGE_SIZE = 5;
const BASE_URL = 'http://localhost:3003';

export const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerModalMode, setPartnerModalMode] = useState<'new' | 'edit'>(
    'new'
  );
  const [partnerForm, setPartnerForm] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    partner_type: 'customer',
    nid: null,
    passport: null,
  });
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerTotal, setPartnerTotal] = useState(0);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [nidViewModal, setNidViewModal] = useState(false);
  const [selectedNidFile, setSelectedNidFile] = useState(null);
  const [passportViewModal, setPassportViewModal] = useState(false);
  const [selectedPassportFile, setSelectedPassportFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [packagesModalOpen, setPackagesModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    setPartnerLoading(true);
    fetch(`${BASE_URL}/partners`)
      .then((res) => res.json())
      .then((data) => {
        setPartners(data.partners || []);
        setPartnerTotal((data.partners || []).length);
        setPartnerLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching partners:', error);
        setPartnerLoading(false);
        toast.error('Failed to load partners. Please try again.');
      });
  }, []);

  // Filter partners based on search term
  const filteredPartners = partners.filter(
    (partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone.includes(searchTerm)
  );

  const paginatedPartners = filteredPartners.slice(
    (partnerPage - 1) * PARTNER_PAGE_SIZE,
    partnerPage * PARTNER_PAGE_SIZE
  );
  const partnerPages = Math.ceil(filteredPartners.length / PARTNER_PAGE_SIZE);

  const openNewPartnerModal = () => {
    setPartnerForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      partner_type: 'customer',
      nid: null,
      passport: null,
    });
    setPartnerModalMode('new');
    setPartnerModalOpen(true);
  };

  const openEditPartnerModal = (partner) => {
    setPartnerForm({ ...partner, nid: null, passport: null });
    setPartnerModalMode('edit');
    setPartnerModalOpen(true);
  };

  const closePartnerModal = () => setPartnerModalOpen(false);

  const openNidViewModal = (nidFilename) => {
    setSelectedNidFile(nidFilename);
    setNidViewModal(true);
    toast.success('📄 Opening NID document viewer');
  };

  const closeNidViewModal = () => {
    setNidViewModal(false);
    setSelectedNidFile(null);
  };

  const openPassportViewModal = (passportFilename) => {
    setSelectedPassportFile(passportFilename);
    setPassportViewModal(true);
    toast.success('📄 Opening Passport document viewer');
  };

  const closePassportViewModal = () => {
    setPassportViewModal(false);
    setSelectedPassportFile(null);
  };

  const openPackagesModal = (partner) => {
    setSelectedCustomer(partner);
    setPackagesModalOpen(true);
  };

  const closePackagesModal = () => {
    setPackagesModalOpen(false);
    setSelectedCustomer(null);
  };

  const handlePartnerFormChange = (e) => {
    const { name, value, files } = e.target;

    // Handle file uploads with validation and feedback
    if (files && files[0]) {
      const file = files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB limit

      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid file type (JPG, PNG, or PDF)');
        e.target.value = ''; // Clear the input
        return;
      }

      toast.success(`📎 ${file.name} selected for upload`);
    }

    setPartnerForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();

    // Show loading toast
    const loadingToast = toast.loading(
      partnerModalMode === 'new' ? 'Creating partner...' : 'Updating partner...'
    );

    try {
      const formData = new FormData();
      formData.append('name', partnerForm.name);
      formData.append('email', partnerForm.email);
      formData.append('phone', partnerForm.phone);
      formData.append('address', partnerForm.address);
      formData.append('partner_type', partnerForm.partner_type);
      if (partnerForm.nid) formData.append('nid', partnerForm.nid);
      if (partnerForm.passport)
        formData.append('passport', partnerForm.passport);

      let response;
      if (partnerModalMode === 'new') {
        response = await fetch(`${BASE_URL}/partners`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/partners/${partnerForm.id}`, {
          method: 'PUT',
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating/updating partner:', errorData);
        toast.error(errorData.error || 'Failed to save partner', {
          id: loadingToast,
        });
        return;
      }

      // Success toast
      toast.success(
        partnerModalMode === 'new'
          ? '🎉 Partner created successfully!'
          : '✅ Partner updated successfully!',
        {
          id: loadingToast,
        }
      );

      closePartnerModal();
      setPartnerPage(1);

      // Refresh the list
      const listResponse = await fetch(`${BASE_URL}/partners`);
      const data = await listResponse.json();
      setPartners(data.partners || []);
      setPartnerTotal((data.partners || []).length);
    } catch (error) {
      console.error('Error in handlePartnerSubmit:', error);
      toast.error('❌ An error occurred while saving partner', {
        id: loadingToast,
      });
    }
  };

  const handleDeletePartner = async (id, partnerName) => {
    // Custom confirmation with better UX
    const confirmed = window.confirm(
      `Are you sure you want to delete "${partnerName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    // Show loading toast
    const loadingToast = toast.loading('Deleting partner...');

    try {
      const response = await fetch(`${BASE_URL}/partners/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting partner:', errorData);
        toast.error(errorData.error || 'Failed to delete partner', {
          id: loadingToast,
        });
        return;
      }

      // Success toast
      toast.success('🗑️ Partner deleted successfully!', {
        id: loadingToast,
      });

      // Refresh the list
      const listResponse = await fetch(`${BASE_URL}/partners`);
      const data = await listResponse.json();
      setPartners(data.partners || []);
      setPartnerTotal((data.partners || []).length);
    } catch (error) {
      console.error('Error in handleDeletePartner:', error);
      toast.error('❌ An error occurred while deleting partner', {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
            <p className="text-gray-600">Manage your customers and vendors</p>
          </div>
        </div>
        <button
          onClick={openNewPartnerModal}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Partners</p>
              <p className="text-2xl font-bold text-gray-900">{partnerTotal}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {partners.filter((p) => p.partner_type === 'customer').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vendors</p>
              <p className="text-2xl font-bold text-gray-900">
                {partners.filter((p) => p.partner_type === 'vendor').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {partnerLoading ? (
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
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {partner.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {partner.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.partner_type === 'customer'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {partner.partner_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{partner.email}</div>
                      <div className="text-gray-500">{partner.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {partner.nid_filename && (
                          <button
                            onClick={() =>
                              openNidViewModal(partner.nid_filename)
                            }
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>NID</span>
                          </button>
                        )}
                        {partner.passport_filename && (
                          <button
                            onClick={() =>
                              openPassportViewModal(partner.passport_filename)
                            }
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Passport</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {partner.partner_type === 'customer' && (
                          <button
                            onClick={() => openPackagesModal(partner)}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Manage Packages"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditPartnerModal(partner)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePartner(partner.id, partner.name)
                          }
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(partnerPage - 1) * PARTNER_PAGE_SIZE + 1} to{' '}
              {Math.min(
                partnerPage * PARTNER_PAGE_SIZE,
                filteredPartners.length
              )}{' '}
              of {filteredPartners.length} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={partnerPage === 1}
                onClick={() => setPartnerPage(partnerPage - 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                {partnerPage} of {partnerPages || 1}
              </span>
              <button
                disabled={partnerPage === partnerPages || partnerPages === 0}
                onClick={() => setPartnerPage(partnerPage + 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal with Modern Design */}
      {partnerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {partnerModalMode === 'new'
                      ? 'Add New Partner'
                      : 'Edit Partner'}
                  </h2>
                </div>
                <button
                  onClick={closePartnerModal}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePartnerSubmit} className="p-6 space-y-6">
              {/* Partner Type - Full Width */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Partner Type
                </label>
                <select
                  name="partner_type"
                  value={partnerForm.partner_type}
                  onChange={handlePartnerFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={partnerForm.name}
                    onChange={handlePartnerFormChange}
                    placeholder="Enter partner name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={partnerForm.email}
                    onChange={handlePartnerFormChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={partnerForm.phone}
                    onChange={handlePartnerFormChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    name="address"
                    value={partnerForm.address}
                    onChange={handlePartnerFormChange}
                    placeholder="Enter address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 3: NID and Passport Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NID Document
                  </label>
                  <input
                    name="nid"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePartnerFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: Images (JPG, PNG) and PDF
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passport Document
                  </label>
                  <input
                    name="passport"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePartnerFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: Images (JPG, PNG) and PDF
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {partnerModalMode === 'new'
                    ? 'Add Partner'
                    : 'Update Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NID View Modal */}
      {nidViewModal && selectedNidFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                NID Document
              </h2>
              <button
                onClick={closeNidViewModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[75vh]">
              {selectedNidFile.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${BASE_URL}/uploads/${selectedNidFile}`}
                  className="w-full h-[60vh] border rounded-lg"
                  title="NID Document"
                />
              ) : (
                <img
                  src={`${BASE_URL}/uploads/${selectedNidFile}`}
                  alt="NID Document"
                  className="w-full h-auto max-h-[60vh] object-contain border rounded-lg"
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <a
                href={`${BASE_URL}/uploads/${selectedNidFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open in New Tab
              </a>
              <button
                onClick={closeNidViewModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passport View Modal */}
      {passportViewModal && selectedPassportFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                Passport Document
              </h2>
              <button
                onClick={closePassportViewModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[75vh]">
              {selectedPassportFile.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${BASE_URL}/uploads/${selectedPassportFile}`}
                  className="w-full h-[60vh] border rounded-lg"
                  title="Passport Document"
                />
              ) : (
                <img
                  src={`${BASE_URL}/uploads/${selectedPassportFile}`}
                  alt="Passport Document"
                  className="w-full h-auto max-h-[60vh] object-contain border rounded-lg"
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <a
                href={`${BASE_URL}/uploads/${selectedPassportFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Open in New Tab
              </a>
              <button
                onClick={closePassportViewModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packages Modal */}
      {packagesModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Package Management - {selectedCustomer.name}
              </h2>
              <button
                onClick={closePackagesModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <CustomerPackages
                customerId={selectedCustomer.id}
                customerName={selectedCustomer.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
