// File: src/components/ClientForm.tsx
import React, { useState } from "react";

interface Client {
  name: string;
  email: string;
  phone: string;
}

const ClientForm: React.FC = () => {
  const [client, setClient] = useState<Client>({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<Client>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Client> = {};
    if (!client.name) newErrors.name = "Name is required";
    if (!client.email) newErrors.email = "Email is required";
    if (!client.phone) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("Submitting client:", client);
    // TODO: Connect to API
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-xl font-semibold">Client Form</h2>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          value={client.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 mt-1"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          name="email"
          value={client.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 mt-1"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          name="phone"
          value={client.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 mt-1"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Client
      </button>
    </form>
  );
};

export default ClientForm;
