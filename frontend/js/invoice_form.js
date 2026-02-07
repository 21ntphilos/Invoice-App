class InvoiceForm {
	constructor() {
		this.itemCount = 0;
		this.items = [];
		this.initializeForm();
		this.attachEventListeners();
	}

	initializeForm() {
		this.addItem(); // Add first item by default
		this.setDefaultDates();
	}

	setDefaultDates() {
		const today = new Date().toISOString().split("T")[0];
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 30);

		document.getElementById("invoiceDate").value = today;
		document.getElementById("dueDate").value = dueDate
			.toISOString()
			.split("T")[0];
	}

	attachEventListeners() {
		document
			.getElementById("addItemBtn")
			.addEventListener("click", () => this.addItem());
		document
			.getElementById("taxRate")
			.addEventListener("input", () => this.calculateTotal());
		document
			.getElementById("discount")
			.addEventListener("input", () => this.calculateTotal());
	}

	addItem() {
		this.itemCount++;
		const itemsContainer = document.getElementById("itemsContainer");

		const itemDiv = document.createElement("div");
		itemDiv.className = "invoice-item";
		itemDiv.dataset.itemId = this.itemCount;

		itemDiv.innerHTML = `
            <div class="item-header">
                <span class="item-number">Item ${this.itemCount}</span>
                <button type="button" class="remove-item" onclick="invoiceForm.removeItem(${this.itemCount})">×</button>
            </div>
            <div class="item-fields">
                <div class="form-group">
                    <label>Description *</label>
                    <input type="text" class="form-control item-description" required>
                </div>
                <div class="form-group">
                    <label>Quantity *</label>
                    <input type="number" class="form-control item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Unit Price *</label>
                    <input type="number" class="form-control item-price" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="text" class="form-control item-amount" readonly value="$0.00">
                </div>
            </div>
        `;

		itemsContainer.appendChild(itemDiv);

		// Attach calculation listeners
		const quantityInput = itemDiv.querySelector(".item-quantity");
		const priceInput = itemDiv.querySelector(".item-price");

		quantityInput.addEventListener("input", () =>
			this.calculateItemAmount(this.itemCount),
		);
		priceInput.addEventListener("input", () =>
			this.calculateItemAmount(this.itemCount),
		);
	}

	removeItem(itemId) {
		const item = document.querySelector(`[data-item-id="${itemId}"]`);
		if (item) {
			item.remove();
			this.calculateTotal();

			// Renumber remaining items
			const items = document.querySelectorAll(".invoice-item");
			items.forEach((item, index) => {
				item.querySelector(".item-number").textContent = `Item ${index + 1}`;
			});
		}
	}

	calculateItemAmount(itemId) {
		const item = document.querySelector(`[data-item-id="${itemId}"]`);
		const quantity =
			parseFloat(item.querySelector(".item-quantity").value) || 0;
		const price = parseFloat(item.querySelector(".item-price").value) || 0;
		const amount = quantity * price;

		item.querySelector(".item-amount").value = `$${amount.toFixed(2)}`;
		this.calculateTotal();
	}

	calculateTotal() {
		const items = document.querySelectorAll(".invoice-item");
		let subtotal = 0;

		items.forEach((item) => {
			const quantity =
				parseFloat(item.querySelector(".item-quantity").value) || 0;
			const price = parseFloat(item.querySelector(".item-price").value) || 0;
			subtotal += quantity * price;
		});

		const discount = parseFloat(document.getElementById("discount").value) || 0;
		const taxRate = parseFloat(document.getElementById("taxRate").value) || 0;

		const afterDiscount = subtotal - discount;
		const taxAmount = afterDiscount * (taxRate / 100);
		const total = afterDiscount + taxAmount;

		document.getElementById("subtotalDisplay").textContent =
			`$${subtotal.toFixed(2)}`;
		document.getElementById("discountDisplay").textContent =
			`$${discount.toFixed(2)}`;
		document.getElementById("taxDisplay").textContent =
			`$${taxAmount.toFixed(2)}`;
		document.getElementById("totalDisplay").textContent =
			`$${total.toFixed(2)}`;
	}

	getFormData() {
		const items = [];
		const itemElements = document.querySelectorAll(".invoice-item");

		itemElements.forEach((item) => {
			items.push({
				description: item.querySelector(".item-description").value,
				quantity: parseInt(item.querySelector(".item-quantity").value),
				unitPrice: parseFloat(item.querySelector(".item-price").value),
			});
		});

		const customerId = document.getElementById("customerId").value;
		const customer  = customers.filter(customer=> customer.id == customerId)

		console.log(customer)

		return {
			customerId: document.getElementById("customerId").value,
			customerEmail: customer.email,
			customerName: customer.name,
			invoiceDate: document.getElementById("invoiceDate").value,
			dueDate: document.getElementById("dueDate").value,
			paymentStatus: document.getElementById("paymentStatusForm").value,
			items: items,
			taxRate: parseFloat(document.getElementById("taxRate").value) || 0,
			discount: parseFloat(document.getElementById("discount").value) || 0,
			notes: document.getElementById("notes").value,
		};
	}

	populateForm(invoice) {
		document.getElementById("invoiceId").value = invoice.id;
		document.getElementById("customerId").value = invoice.customerId;
		document.getElementById("invoiceDate").value =
			invoice.invoiceDate.split("T")[0];
		document.getElementById("dueDate").value = invoice.dueDate.split("T")[0];
		document.getElementById("paymentStatusForm").value = invoice.paymentStatus;
		document.getElementById("taxRate").value = invoice.taxRate;
		document.getElementById("discount").value = invoice.discount;
		document.getElementById("notes").value = invoice.notes || "";

		// Clear existing items
		document.getElementById("itemsContainer").innerHTML = "";
		this.itemCount = 0;

		// Add invoice items
		invoice.items.forEach((item) => {
			this.addItem();
			const itemDiv = document.querySelector(
				`[data-item-id="${this.itemCount}"]`,
			);
			itemDiv.querySelector(".item-description").value = item.description;
			itemDiv.querySelector(".item-quantity").value = item.quantity;
			itemDiv.querySelector(".item-price").value = item.unitPrice;
			this.calculateItemAmount(this.itemCount);
		});
	}

	reset() {
		document.getElementById("invoiceForm").reset();
		document.getElementById("invoiceId").value = "";
		document.getElementById("itemsContainer").innerHTML = "";
		this.itemCount = 0;
		this.addItem();
		this.setDefaultDates();
		this.calculateTotal();
	}
}

const invoiceForm = new InvoiceForm();
