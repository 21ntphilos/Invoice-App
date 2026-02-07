let customers = [];

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
	await loadCustomers();
	await invoiceList.loadInvoices();
	initializeEventListeners();
});

async function loadCustomers() {
	try {
		customers = await api.getCustomers();
		populateCustomerDropdowns();
	} catch (error) {
		console.error("Error loading customers:", error);
	}
}

function populateCustomerDropdowns() {
	const customerSelect = document.getElementById("customerId");
	const customerFilter = document.getElementById("customerFilter");

	const options = customers
		.map(
			(customer) => `<option value="${customer.id}">${customer.name}</option>`,
		)
		.join("");

	customerSelect.innerHTML =
		'<option value="">Select Customer</option>' + options;
	customerFilter.innerHTML =
		'<option value="">All Customers</option>' + options;
}

function initializeEventListeners() {
	// Modal controls
	const modal = document.getElementById("invoiceModal");
	const detailModal = document.getElementById("invoiceDetailModal");
	const uploadModal = document.getElementById("fileUploadModal");

	document.getElementById("newInvoiceBtn").addEventListener("click", () => {
		document.getElementById("modalTitle").textContent = "Create New Invoice";
		invoiceForm.reset();
		modal.style.display = "block";
	});

	document.querySelector(".close").addEventListener("click", () => {
		modal.style.display = "none";
	});

	document.querySelector(".close-detail").addEventListener("click", () => {
		detailModal.style.display = "none";
	});

	document.querySelector(".close-upload").addEventListener("click", () => {
		uploadModal.style.display = "none";
	});

	document.getElementById("cancelBtn").addEventListener("click", () => {
		modal.style.display = "none";
	});

	window.addEventListener("click", (event) => {
		if (event.target === modal) modal.style.display = "none";
		if (event.target === detailModal) detailModal.style.display = "none";
		if (event.target === uploadModal) uploadModal.style.display = "none";
	});

	// Form submission
	document
		.getElementById("invoiceForm")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			await handleInvoiceSubmit();
		});

	// Filters
	document
		.getElementById("applyFilters")
		.addEventListener("click", applyFilters);
	document
		.getElementById("clearFilters")
		.addEventListener("click", clearFilters);

	// File upload
	document
		.getElementById("uploadFileBtn")
		.addEventListener("click", handleFileUpload);
	document.getElementById("cancelUploadBtn").addEventListener("click", () => {
		uploadModal.style.display = "none";
	});
}

async function handleInvoiceSubmit() {
	try {

    
		const formData = invoiceForm.getFormData();
		const invoiceId = document.getElementById("invoiceId").value;

        console.log(formData)

		if (invoiceId) {
			await api.updateInvoice(invoiceId, formData);
		} else {
			await api.createInvoice(formData);
		}

		document.getElementById("invoiceModal").style.display = "none";
		await invoiceList.loadInvoices(invoiceList.currentFilters);
	} catch (error) {
		console.error("Error saving invoice:", error);
		alert("Error saving invoice: " + error.message);
	}
}

async function applyFilters() {
	const filters = {
		startDate: document.getElementById("startDate").value,
		endDate: document.getElementById("endDate").value,
		paymentStatus: document.getElementById("paymentStatus").value,
		customerId: document.getElementById("customerFilter").value,
	};

	await invoiceList.loadInvoices(filters);
}

function clearFilters() {
	document.getElementById("startDate").value = "";
	document.getElementById("endDate").value = "";
	document.getElementById("paymentStatus").value = "";
	document.getElementById("customerFilter").value = "";
	invoiceList.loadInvoices();
}

async function handleFileUpload() {
	const fileInput = document.getElementById("fileInput");
	const file = fileInput.files[0];

	if (!file) {
		alert("Please select a file");
		return;
	}

	if (file.size > 5 * 1024 * 1024) {
		alert("File size must be less than 5MB");
		return;
	}

	try {
		const invoiceId = document.getElementById("uploadInvoiceId").value;
		const progressBar = document.getElementById("uploadProgress");
		const bar = progressBar.querySelector(".progress-bar");

		progressBar.style.display = "block";
		bar.style.width = "50%";

		await api.uploadFile(invoiceId, file);

		bar.style.width = "100%";

		setTimeout(() => {
			document.getElementById("fileUploadModal").style.display = "none";
			progressBar.style.display = "none";
			bar.style.width = "0%";
			invoiceList.loadInvoices(invoiceList.currentFilters);
		}, 500);
	} catch (error) {
		console.error("Error uploading file:", error);
		alert("Error uploading file: " + error.message);
	}
}
