(() => {
    let customers = [];

    const form = document.querySelector("#customer-form");
    if (!form) return;

    const fields = {
        id: document.querySelector("#customer-id"),
        name: document.querySelector("#customer-name"),
        email: document.querySelector("#customer-email"),
        phone: document.querySelector("#customer-phone"),
        city: document.querySelector("#customer-city")
    };
    const rows = document.querySelector("#customer-rows");
    const emptyMessage = document.querySelector("#customer-empty");
    const search = document.querySelector("#customer-search");
    const count = document.querySelector("#customer-count");
    const title = document.querySelector("#customer-form-title");
    const submit = document.querySelector("#customer-submit");
    const cancel = document.querySelector("#customer-cancel");

    async function loadCustomers() {
        try {
            const res = await fetch("/api/customers");
            if (!res.ok) throw new Error("Failed to fetch customers");
            customers = await res.json();
            render();
        } catch (err) {
            console.error("Error loading customers:", err);
        }
    }

    function render() {
        const query = search.value.trim().toLocaleLowerCase();
        const visibleCustomers = customers.filter(customer =>
            Object.values(customer).some(value => String(value).toLocaleLowerCase().includes(query)));

        rows.replaceChildren();
        for (const customer of visibleCustomers) {
            const row = document.createElement("tr");
            for (const value of [customer.name, customer.email, customer.phone, customer.city]) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            }

            const actions = document.createElement("td");
            actions.className = "text-end text-nowrap";
            actions.append(
                createActionButton("Edit", "edit", customer.id, "btn-outline-primary"),
                document.createTextNode(" "),
                createActionButton("Delete", "delete", customer.id, "btn-outline-danger")
            );
            row.append(actions);
            rows.append(row);
        }

        count.textContent = String(customers.length);
        emptyMessage.classList.toggle("d-none", visibleCustomers.length !== 0);
    }

    function createActionButton(label, action, id, style) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `btn btn-sm ${style}`;
        button.dataset.action = action;
        button.dataset.id = String(id);
        button.textContent = label;
        return button;
    }

    function resetForm() {
        form.reset();
        fields.id.value = "";
        title.textContent = "Add customer";
        submit.textContent = "Add customer";
        cancel.classList.add("d-none");
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const customer = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            city: fields.city.value.trim()
        };

        try {
            submit.disabled = true;
            if (fields.id.value) {
                const id = Number(fields.id.value);
                const res = await fetch(`/api/customers/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, ...customer })
                });
                if (!res.ok) throw new Error("Failed to update customer");
            } else {
                const res = await fetch("/api/customers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(customer)
                });
                if (!res.ok) throw new Error("Failed to add customer");
            }

            resetForm();
            await loadCustomers();
        } catch (err) {
            console.error("Error saving customer:", err);
            alert("Error saving customer to database");
        } finally {
            submit.disabled = false;
        }
    });

    rows.addEventListener("click", async event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const customer = customers.find(item => item.id === id);
        if (!customer) return;

        if (button.dataset.action === "delete") {
            if (!confirm(`Are you sure you want to delete "${customer.name}"?`)) return;
            try {
                const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete customer");
                if (fields.id.value === String(id)) resetForm();
                await loadCustomers();
            } catch (err) {
                console.error("Error deleting customer:", err);
                alert("Error deleting customer from database");
            }
            return;
        }

        fields.id.value = String(customer.id);
        fields.name.value = customer.name;
        fields.email.value = customer.email;
        fields.phone.value = customer.phone;
        fields.city.value = customer.city;
        title.textContent = "Edit customer";
        submit.textContent = "Save changes";
        cancel.classList.remove("d-none");
        fields.name.focus();
    });

    search.addEventListener("input", render);
    cancel.addEventListener("click", resetForm);

    loadCustomers();
})();
