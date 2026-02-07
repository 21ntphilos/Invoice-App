class InvoiceList {
	constructor() {
		this.invoices = [];
		this.currentFilters = {};
	}

	async loadInvoices(filters = {}) {
		try {
			const listContainer = document.getElementById("invoiceList");
			listContainer.innerHTML =
				'<div class="loading">Loading invoices...</div>';

			this.currentFilters = filters;
			const invoiceresponse = await api.getInvoices(filters);
            this.invoices = invoiceresponse.data

            console.log("INVOICES ===>",this.invoices)
			this.render();
		} catch (error) {
			console.error("Error loading invoices:", error);
			document.getElementById("invoiceList").innerHTML =
				'<div class="empty-state">Error loading invoices. Please try again.</div>';
		}
	}

	render() {
		const listContainer = document.getElementById("invoiceList");

		if (this.invoices.length === 0) {
			listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <p>No invoices found</p>
                </div>
            `;
			return;
		}

        console.log("=====>",this.invoices)

		listContainer.innerHTML = this.invoices
			.map((invoice) => this.renderInvoiceCard(invoice))
			.join("");
	}

	renderInvoiceCard(invoice) {
		const statusClass = `status-${invoice.paymentStatus}`;
		const statusText =
			invoice.paymentStatus.charAt(0).toUpperCase() +
			invoice.paymentStatus.slice(1);

		return `
            <div class="invoice-card" onclick="invoiceList.viewInvoice('${invoice.id}')">
                <div class="invoice-card-header">
                    <div>
                        <div class="invoice-number">${invoice.invoiceNumber}</div>
                        <div class="invoice-info-value">${invoice.customerName}</div>
                    </div>
                    <span class="invoice-status ${statusClass}">${statusText}</span>
                </div>
                <div class="invoice-card-body">
                    <div class="invoice-info">
                        <div class="invoice-info-label">Invoice Date</div>
                        <div class="invoice-info-value">${this.formatDate(invoice.invoiceDate)}</div>
                    </div>
                    <div class="invoice-info">
                        <div class="invoice-info-label">Due Date</div>
                        <div class="invoice-info-value">${this.formatDate(invoice.dueDate)}</div>
                    </div>
                    <div class="invoice-info">
                        <div class="invoice-info-label">Total Amount</div>
                        <div class="invoice-total">$${parseFloat(invoice.totalAmount).toFixed(2)}</div>
                    </div>
                </div>
                <div class="invoice-card-footer" onclick="event.stopPropagation()">
                    <button class="btn btn-small btn-outline" onclick="invoiceList.editInvoice('${invoice.id}')">Edit</button>
                    <button class="btn btn-small btn-outline" onclick="invoiceList.showUploadModal('${invoice.id}')">Upload File</button>
                    <button class="btn btn-small btn-danger" onclick="invoiceList.deleteInvoice('${invoice.id}')">Delete</button>
                </div>
            </div>
        `;
	}

	formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	async viewInvoice(id) {
		try {
			const invoice = await api.getInvoice(id);
			this.showInvoiceDetail(invoice);
		} catch (error) {
			console.error("Error loading invoice:", error);
			alert("Error loading invoice details");
		}
	}

	showInvoiceDetail(invoice) {
		const modal = document.getElementById("invoiceDetailModal");
		const content = document.getElementById("invoiceDetailContent");

		const statusClass = `status-${invoice.paymentStatus}`;
		const statusText =
			invoice.paymentStatus.charAt(0).toUpperCase() +
			invoice.paymentStatus.slice(1);

		content.innerHTML = `
            <div class="detail-section">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h2>${invoice.invoiceNumber}</h2>
                        <p style="color: var(--text-muted); margin-top: 4px;">${invoice.customer.name}</p>
                    </div>
                    <span class="invoice-status ${statusClass}">${statusText}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>Invoice Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Invoice Date</div>
                        <div class="detail-value">${this.formatDate(invoice.invoiceDate)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Due Date</div>
                        <div class="detail-value">${this.formatDate(invoice.dueDate)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Customer Email</div>
                        <div class="detail-value">${invoice.customer.email}</div>
                    </div>
                    ${
											invoice.customer.phone
												? `
                    <div class="detail-item">
                        <div class="detail-label">Customer Phone</div>
                        <div class="detail-value">${invoice.customer.phone}</div>
                    </div>
                    `
												: ""
										}
                </div>
            </div>

            <div class="detail-section">
                <h3>Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="text-right">Quantity</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items
													.map(
														(item) => `
                            <tr>
                                <td>${item.description}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                                <td class="text-right">$${parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        `,
													)
													.join("")}
                    </tbody>
                </table>
            </div>

            <div class="detail-section">
                <div class="invoice-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${parseFloat(invoice.subtotal).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Discount:</span>
                        <span>$${parseFloat(invoice.discount).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (${invoice.taxRate}%):</span>
                        <span>$${parseFloat(invoice.taxAmount).toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${parseFloat(invoice.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            ${
							invoice.notes
								? `
            <div class="detail-section">
                <h3>Notes</h3>
                <p>${invoice.notes}</p>
            </div>
            `
								: ""
						}

            <div class="detail-section">
                <h3>Attached Files</h3>
                ${
									invoice.files.length > 0
										? `
                    <div class="files-list">
                        ${invoice.files
													.map(
														(file) => `
                            <div class="file-item">
                                <div class="file-info">
                                    <span class="file-name">📎 ${file.fileName}</span>
                                    <span class="file-size">${this.formatFileSize(file.fileSize)}</span>
                                </div>
                                <div class="file-actions">
                                    <a href="${api.getFileDownloadUrl(file.id)}" class="btn btn-small btn-outline" download>Download</a>
                                    <button class="btn btn-small btn-danger" onclick="invoiceList.deleteFile('${file.id}')">Delete</button>
                                </div>
                            </div>
                        `,
													)
													.join("")}
                    </div>
                `
										: '<p style="color: var(--text-muted);">No files attached</p>'
								}
            </div>
        `;

		modal.style.display = "block";
	}

	formatFileSize(bytes) {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
		return (bytes / (1024 * 1024)).toFixed(1) + " MB";
	}

	async editInvoice(id) {
		try {
			const invoice = await api.getInvoice(id);
			document.getElementById("modalTitle").textContent = "Edit Invoice";
			invoiceForm.populateForm(invoice);
			document.getElementById("invoiceModal").style.display = "block";
		} catch (error) {
			console.error("Error loading invoice:", error);
			alert("Error loading invoice for editing");
		}
	}

	async deleteInvoice(id) {
		if (!confirm("Are you sure you want to delete this invoice?")) {
			return;
		}

		try {
			await api.deleteInvoice(id);
			await this.loadInvoices(this.currentFilters);
		} catch (error) {
			console.error("Error deleting invoice:", error);
			alert("Error deleting invoice");
		}
	}

	showUploadModal(invoiceId) {
		document.getElementById("uploadInvoiceId").value = invoiceId;
		document.getElementById("fileInput").value = "";
		document.getElementById("fileUploadModal").style.display = "block";
	}

	async deleteFile(fileId) {
		if (!confirm("Are you sure you want to delete this file?")) {
			return;
		}

		try {
			await api.deleteFile(fileId);
			// Reload the current invoice detail
			const modal = document.getElementById("invoiceDetailModal");
			if (modal.style.display === "block") {
				// Find the invoice ID from the current view and reload
				await this.loadInvoices(this.currentFilters);
			}
		} catch (error) {
			console.error("Error deleting file:", error);
			alert("Error deleting file");
		}
	}
}

const invoiceList = new InvoiceList();
