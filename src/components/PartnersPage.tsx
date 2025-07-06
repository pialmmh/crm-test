import { useEffect, useState } from 'react';

const PARTNER_PAGE_SIZE = 5;
const BASE_URL = 'http://localhost:3001';

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
  });
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerTotal, setPartnerTotal] = useState(0);
  const [partnerLoading, setPartnerLoading] = useState(false);

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
        alert('Error fetching partners: ' + error.message);
      });
  }, []);

  const paginatedPartners = partners.slice(
    (partnerPage - 1) * PARTNER_PAGE_SIZE,
    partnerPage * PARTNER_PAGE_SIZE
  );
  const partnerPages = Math.ceil(partnerTotal / PARTNER_PAGE_SIZE);

  const openNewPartnerModal = () => {
    setPartnerForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      partner_type: 'customer',
      nid: null,
    });
    setPartnerModalMode('new');
    setPartnerModalOpen(true);
  };

  const openEditPartnerModal = (partner) => {
    setPartnerForm({ ...partner, nid: null });
    setPartnerModalMode('edit');
    setPartnerModalOpen(true);
  };

  const closePartnerModal = () => setPartnerModalOpen(false);

  const handlePartnerFormChange = (e) => {
    const { name, value, files } = e.target;
    setPartnerForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', partnerForm.name);
      formData.append('email', partnerForm.email);
      formData.append('phone', partnerForm.phone);
      formData.append('address', partnerForm.address);
      formData.append('partner_type', partnerForm.partner_type);
      if (partnerForm.nid) formData.append('nid', partnerForm.nid);

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
        alert('Error: ' + (errorData.error || 'Unknown error'));
        return;
      }

      closePartnerModal();
      setPartnerPage(1);

      // Refresh the list
      const listResponse = await fetch(`${BASE_URL}/partners`);
      const data = await listResponse.json();
      setPartners(data.partners || []);
      setPartnerTotal((data.partners || []).length);
    } catch (error) {
      console.error('Error in handlePartnerSubmit:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeletePartner = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/partners/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting partner:', errorData);
        alert('Error: ' + (errorData.error || 'Unknown error'));
        return;
      }

      // Refresh the list
      const listResponse = await fetch(`${BASE_URL}/partners`);
      const data = await listResponse.json();
      setPartners(data.partners || []);
      setPartnerTotal((data.partners || []).length);
    } catch (error) {
      console.error('Error in handleDeletePartner:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Partners
        </h1>
        <button
          onClick={openNewPartnerModal}
          className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          New
        </button>
      </div>
      {partnerLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full max-w-full bg-white border rounded mb-4 text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2 border-b">ID</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Name</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Type</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Email</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Phone</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Address</th>
                  <th className="px-2 sm:px-4 py-2 border-b">NID</th>
                  <th className="px-2 sm:px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPartners.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 sm:px-4 py-2 border-b text-center">
                      {p.id}
                    </td>
                    <td className="px-2 sm:px-4 py-2 border-b">{p.name}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">
                      {p.partner_type}
                    </td>
                    <td className="px-2 sm:px-4 py-2 border-b">{p.email}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{p.phone}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{p.address}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">
                      {p.nid_filename ? (
                        <a
                          href={`${BASE_URL}/uploads/${p.nid_filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 border-b text-center">
                      <button
                        onClick={() => openEditPartnerModal(p)}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePartner(p.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            <button
              disabled={partnerPage === 1}
              onClick={() => setPartnerPage(partnerPage - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {partnerPage} of {partnerPages}
            </span>
            <button
              disabled={partnerPage === partnerPages}
              onClick={() => setPartnerPage(partnerPage + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md relative">
            <button
              onClick={closePartnerModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {partnerModalMode === 'new' ? 'Add Partner' : 'Edit Partner'}
            </h2>
            <form
              onSubmit={handlePartnerSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <select
                name="partner_type"
                value={partnerForm.partner_type}
                onChange={handlePartnerFormChange}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              <input
                name="name"
                value={partnerForm.name}
                onChange={handlePartnerFormChange}
                placeholder="Name"
                className="border rounded px-2 py-1 w-full"
                required
              />
              <input
                name="email"
                value={partnerForm.email}
                onChange={handlePartnerFormChange}
                placeholder="Email"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="phone"
                value={partnerForm.phone}
                onChange={handlePartnerFormChange}
                placeholder="Phone"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="address"
                value={partnerForm.address}
                onChange={handlePartnerFormChange}
                placeholder="Address"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="nid"
                type="file"
                accept="image/*,.pdf"
                onChange={handlePartnerFormChange}
                className="border rounded px-2 py-1 w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                {partnerModalMode === 'new' ? 'Add' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
