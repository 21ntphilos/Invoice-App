const API_BASE_URL = "http://localhost:3000";

class API {
	async request(endpoint, options = {}) {
		const url = `${API_BASE_URL}${endpoint}`;

        console.log(endpoint, '=====>', options)

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					...options.headers,
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Something went wrong");
			}

			return await response.json();
		} catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	}

	// Invoices
	async getInvoices(filters = {}) {
		const params = new URLSearchParams();
		if (filters.startDate) params.append("startDate", filters.startDate);
		if (filters.endDate) params.append("endDate", filters.endDate);
		if (filters.paymentStatus)
			params.append("paymentStatus", filters.paymentStatus);
		if (filters.customerId) params.append("customerId", filters.customerId);

		const queryString = params.toString();
		return this.request(`/invoices/all${queryString ? `?${queryString}` : ""}`);
	}

	async getInvoice(id) {
		return this.request(`/invoices/${id}`);
	}

	async createInvoice(data) {
		return this.request("/invoice", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateInvoice(id, data) {
		return this.request(`/invoices/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		});
	}

	async deleteInvoice(id) {
		return this.request(`/invoices/${id}`, {
			method: "DELETE",
		});
	}

	// Files
	async uploadFile(invoiceId, file) {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(
			`${API_BASE_URL}/invoices/${invoiceId}/files`,
			{
				method: "POST",
				body: formData,
			},
		);

		if (!response.ok) {
			throw new Error("File upload failed");
		}

		return await response.json();
	}

	async deleteFile(fileId) {
		return this.request(`/invoices/files/${fileId}`, {
			method: "DELETE",
		});
	}

	getFileDownloadUrl(fileId) {
		return `${API_BASE_URL}/invoices/files/${fileId}/download`;
	}

	// Customers
	async getCustomers() {
		return this.request("/customers");
	}
}

const api = new API();
