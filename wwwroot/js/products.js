(() => {
    const products = [
        { id: 1, name: "Wireless headphones", category: "Electronics", price: 1250000, stock: 12 },
        { id: 2, name: "Mechanical keyboard", category: "Accessories", price: 890000, stock: 4 },
        { id: 3, name: "USB-C cable", category: "Accessories", price: 120000, stock: 0 }
    ];
    let nextId = 4;

    const form = document.querySelector("#product-form");
    if (!form) return;

    const fields = {
        id: document.querySelector("#product-id"),
        name: document.querySelector("#product-name"),
        category: document.querySelector("#product-category"),
        price: document.querySelector("#product-price"),
        stock: document.querySelector("#product-stock")
    };
    const rows = document.querySelector("#product-rows");
    const emptyMessage = document.querySelector("#product-empty");
    const search = document.querySelector("#product-search");
    const count = document.querySelector("#product-count");
    const title = document.querySelector("#product-form-title");
    const submit = document.querySelector("#product-submit");
    const cancel = document.querySelector("#product-cancel");
    const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

    function button(label, action, id, style) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = `btn btn-sm ${style}`;
        element.dataset.action = action;
        element.dataset.id = String(id);
        element.textContent = label;
        return element;
    }

    function cell(value, className = "") {
        const element = document.createElement("td");
        element.className = className;
        element.textContent = value;
        return element;
    }

    function availability(stock) {
        if (stock === 0) return { label: "Out of stock", style: "text-bg-secondary" };
        if (stock <= 5) return { label: "Low stock", style: "text-bg-warning" };
        return { label: "In stock", style: "text-bg-success" };
    }

    function render() {
        const query = search.value.trim().toLocaleLowerCase();
        const visibleProducts = products.filter(product =>
            Object.values(product).some(value => String(value).toLocaleLowerCase().includes(query)));

        rows.replaceChildren();
        for (const product of visibleProducts) {
            const row = document.createElement("tr");
            row.append(
                cell(product.name),
                cell(product.category),
                cell(money.format(product.price), "text-end"),
                cell(String(product.stock), "text-end")
            );

            const stock = availability(product.stock);
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = `badge ${stock.style}`;
            badge.textContent = stock.label;
            statusCell.append(badge);
            row.append(statusCell);

            const actions = document.createElement("td");
            actions.className = "text-end text-nowrap";
            actions.append(
                button("Edit", "edit", product.id, "btn-outline-primary"),
                document.createTextNode(" "),
                button("Delete", "delete", product.id, "btn-outline-danger")
            );
            row.append(actions);
            rows.append(row);
        }

        count.textContent = String(products.length);
        emptyMessage.classList.toggle("d-none", visibleProducts.length !== 0);
    }

    function resetForm() {
        form.reset();
        fields.id.value = "";
        title.textContent = "Add product";
        submit.textContent = "Add product";
        cancel.classList.add("d-none");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const details = {
            name: fields.name.value.trim(),
            category: fields.category.value.trim(),
            price: Number(fields.price.value),
            stock: Number(fields.stock.value)
        };
        if (!Number.isSafeInteger(details.price) || details.price < 1 ||
            !Number.isSafeInteger(details.stock) || details.stock < 0) return;

        if (fields.id.value) {
            const existing = products.find(product => product.id === Number(fields.id.value));
            if (!existing) return;
            Object.assign(existing, details);
        } else {
            products.push({ id: nextId++, ...details });
        }

        resetForm();
        render();
    });

    rows.addEventListener("click", event => {
        const action = event.target.closest("button[data-action]");
        if (!action) return;

        const id = Number(action.dataset.id);
        const index = products.findIndex(product => product.id === id);
        if (index < 0) return;

        if (action.dataset.action === "delete") {
            products.splice(index, 1);
            if (fields.id.value === String(id)) resetForm();
            render();
            return;
        }

        const product = products[index];
        fields.id.value = String(product.id);
        fields.name.value = product.name;
        fields.category.value = product.category;
        fields.price.value = String(product.price);
        fields.stock.value = String(product.stock);
        title.textContent = "Edit product";
        submit.textContent = "Save changes";
        cancel.classList.remove("d-none");
        fields.name.focus();
    });

    search.addEventListener("input", render);
    cancel.addEventListener("click", resetForm);
    render();
})();
