(() => {
    let orders = [];

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

    async function loadOrders() {
        try {
            const res = await fetch("/api/orders");
            if (!res.ok) throw new Error("Failed to fetch orders");
            orders = await res.json();
            render();
        } catch (err) {
            console.error("Error loading orders:", err);
        }
    }

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
            badge.className = `badge ${statusStyles[order.status] || "text-bg-light"}`;
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

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const order = {
            customer: fields.customer.value.trim(),
            item: fields.item.value.trim(),
            quantity: Number(fields.quantity.value),
            unitPrice: Number(fields.unitPrice.value),
            status: fields.status.value
        };

        if (!Number.isSafeInteger(order.quantity) || order.quantity < 1 ||
            !Number.isSafeInteger(order.unitPrice) || order.unitPrice < 1) return;

        try {
            submit.disabled = true;
            if (fields.id.value) {
                const id = Number(fields.id.value);
                const existing = orders.find(item => item.id === id);
                const number = existing ? existing.number : "";
                const res = await fetch(`/api/orders/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, number, ...order })
                });
                if (!res.ok) throw new Error("Failed to update order");
            } else {
                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(order)
                });
                if (!res.ok) throw new Error("Failed to create order");
            }

            resetForm();
            await loadOrders();
        } catch (err) {
            console.error("Error saving order:", err);
            alert("Error saving order to database");
        } finally {
            submit.disabled = false;
        }
    });

    rows.addEventListener("click", async event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const order = orders.find(item => item.id === id);
        if (!order) return;

        if (button.dataset.action === "delete") {
            if (!confirm(`Are you sure you want to delete order "${order.number}"?`)) return;
            try {
                const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete order");
                if (fields.id.value === String(id)) resetForm();
                await loadOrders();
            } catch (err) {
                console.error("Error deleting order:", err);
                alert("Error deleting order from database");
            }
            return;
        }

        fields.id.value = String(order.id);
        fields.customer.value = order.customer;
        fields.item.value = order.item;
        fields.quantity.value = String(order.quantity);
        fields.unitPrice.value = String(order.unitPrice);
        fields.status.value = order.status;
        title.textContent = "Edit order";
        submit.textContent = "Save changes";
        cancel.classList.remove("d-none");
        fields.customer.focus();
    });

    search.addEventListener("input", render);
    cancel.addEventListener("click", resetForm);

    loadOrders();
})();
