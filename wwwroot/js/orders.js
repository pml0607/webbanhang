(() => {
    const orders = [
        { id: 1, number: "ORD-1001", customer: "Nguyen Minh Anh", item: "Wireless headphones", quantity: 1, unitPrice: 1250000, status: "Processing" },
        { id: 2, number: "ORD-1002", customer: "Tran Quoc Bao", item: "Mechanical keyboard", quantity: 2, unitPrice: 890000, status: "Pending" }
    ];
    let nextId = 3;

    const form = document.querySelector("#order-form");
    if (!form) return;

    const fields = {
        id: document.querySelector("#order-id"),
        customer: document.querySelector("#order-customer"),
        item: document.querySelector("#order-item"),
        quantity: document.querySelector("#order-quantity"),
        unitPrice: document.querySelector("#order-price"),
        status: document.querySelector("#order-status")
    };
    const rows = document.querySelector("#order-rows");
    const emptyMessage = document.querySelector("#order-empty");
    const search = document.querySelector("#order-search");
    const count = document.querySelector("#order-count");
    const title = document.querySelector("#order-form-title");
    const submit = document.querySelector("#order-submit");
    const cancel = document.querySelector("#order-cancel");
    const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
    const statusStyles = {
        Pending: "text-bg-warning",
        Processing: "text-bg-info",
        Shipped: "text-bg-success",
        Cancelled: "text-bg-secondary"
    };

    function textCell(value, className = "") {
        const cell = document.createElement("td");
        cell.className = className;
        cell.textContent = value;
        return cell;
    }

    function actionButton(label, action, id, style) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `btn btn-sm ${style}`;
        button.dataset.action = action;
        button.dataset.id = String(id);
        button.textContent = label;
        return button;
    }

    function render() {
        const query = search.value.trim().toLocaleLowerCase();
        const visibleOrders = orders.filter(order =>
            Object.values(order).some(value => String(value).toLocaleLowerCase().includes(query)));

        rows.replaceChildren();
        for (const order of visibleOrders) {
            const row = document.createElement("tr");
            row.append(
                textCell(order.number),
                textCell(order.customer),
                textCell(order.item),
                textCell(String(order.quantity), "text-end"),
                textCell(money.format(order.quantity * order.unitPrice), "text-end")
            );

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = `badge ${statusStyles[order.status]}`;
            badge.textContent = order.status;
            statusCell.append(badge);
            row.append(statusCell);

            const actions = document.createElement("td");
            actions.className = "text-end text-nowrap";
            actions.append(
                actionButton("Edit", "edit", order.id, "btn-outline-primary"),
                document.createTextNode(" "),
                actionButton("Delete", "delete", order.id, "btn-outline-danger")
            );
            row.append(actions);
            rows.append(row);
        }

        count.textContent = String(orders.length);
        emptyMessage.classList.toggle("d-none", visibleOrders.length !== 0);
    }

    function resetForm() {
        form.reset();
        fields.id.value = "";
        fields.quantity.value = "1";
        fields.status.value = "Pending";
        title.textContent = "Create order";
        submit.textContent = "Create order";
        cancel.classList.add("d-none");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const orderDetails = {
            customer: fields.customer.value.trim(),
            item: fields.item.value.trim(),
            quantity: Number(fields.quantity.value),
            unitPrice: Number(fields.unitPrice.value),
            status: fields.status.value
        };
        if (!Number.isSafeInteger(orderDetails.quantity) || orderDetails.quantity < 1 ||
            !Number.isSafeInteger(orderDetails.unitPrice) || orderDetails.unitPrice < 1 ||
            !Number.isSafeInteger(orderDetails.quantity * orderDetails.unitPrice)) return;

        if (fields.id.value) {
            const existing = orders.find(order => order.id === Number(fields.id.value));
            if (!existing) return;
            Object.assign(existing, orderDetails);
        } else {
            orders.push({ id: nextId, number: `ORD-${1000 + nextId++}`, ...orderDetails });
        }

        resetForm();
        render();
    });

    rows.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const index = orders.findIndex(order => order.id === id);
        if (index < 0) return;

        if (button.dataset.action === "delete") {
            orders.splice(index, 1);
            if (fields.id.value === String(id)) resetForm();
            render();
            return;
        }

        const order = orders[index];
        fields.id.value = String(order.id);
        fields.customer.value = order.customer;
        fields.item.value = order.item;
        fields.quantity.value = String(order.quantity);
        fields.unitPrice.value = String(order.unitPrice);
        fields.status.value = order.status;
        title.textContent = `Edit ${order.number}`;
        submit.textContent = "Save changes";
        cancel.classList.remove("d-none");
        fields.customer.focus();
    });

    search.addEventListener("input", render);
    cancel.addEventListener("click", resetForm);
    render();
})();
