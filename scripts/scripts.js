// Проверка показа pop-up при первом входе
window.addEventListener('DOMContentLoaded', () => {
    preload();
    if (!localStorage.getItem('popupShown')) {
        document.getElementById('popup').style.display = 'flex';
    }
    initializeClientData();
    integrateSocialNetworks();
    setupLanguageSwitcher();
    setupBurgerMenu();
    setupAuthForm();
    setupSearch();
    loadBooks();
    renderCartInfo();
    renderViewed();
});

let currentGenre = 'Все';

function preload() {
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s';
        document.body.style.opacity = 1;
    }, 100);
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    localStorage.setItem('popupShown', 'true');
}

function isMobile() {
    return window.innerWidth <= 768;
}

function setupBurgerMenu() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

function sanitizeInput(input) {
    return input.replace(/[^\w@.\-\s]/gi, '');
}

function initializeClientData() {
    let client = JSON.parse(localStorage.getItem('client'));
    if (!client) {
        client = {
            id: 'guest-' + Date.now(),
            имя: 'Гость',
            фамилия: '',
            email: '',
            тип: 'гость'
        };
        localStorage.setItem('client', JSON.stringify(client));
    }
    document.querySelector('.login-btn')?.addEventListener('click', () => {
        const name = prompt("Введите ваше имя:");
        const surname = prompt("Введите вашу фамилию:");
        const email = prompt("Введите email:");
        if (name && email) {
            client = {
                id: 'user-' + Date.now(),
                имя: sanitizeInput(name),
                фамилия: sanitizeInput(surname || ''),
                email: sanitizeInput(email),
                тип: 'авторизованный'
            };
            localStorage.setItem('client', JSON.stringify(client));
            alert("Добро пожаловать, " + client.имя + "!");
        }
    });
}

function integrateSocialNetworks() {
    const tgButton = document.createElement('a');
    tgButton.href = 'https://t.me/share/url?url=' + encodeURIComponent(window.location.href);
    tgButton.textContent = 'Поделиться в Telegram';
    tgButton.target = '_blank';
    tgButton.className = 'social-link';

    const vkButton = document.createElement('a');
    vkButton.href = 'https://vk.com/share.php?url=' + encodeURIComponent(window.location.href);
    vkButton.textContent = 'Поделиться в ВКонтакте';
    vkButton.target = '_blank';
    vkButton.className = 'social-link';

    const footer = document.querySelector('footer .footer-grid') || document.querySelector('footer');
    const socialDiv = document.createElement('div');
    socialDiv.className = 'social-share';
    socialDiv.appendChild(tgButton);
    socialDiv.appendChild(document.createElement('br'));
    socialDiv.appendChild(vkButton);
    footer.appendChild(socialDiv);
}

const authorSelect = document.getElementById('author');
authorSelect.addEventListener('change', () => loadBooks());

function navigateGenre(genre) {
    currentGenre = genre;
    loadBooks();
}

function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Поиск по названию...';
    searchInput.style.margin = '1rem 0';
    searchInput.addEventListener('input', () => loadBooks(searchInput.value));
    document.querySelector('.catalog-section .container').prepend(searchInput);
}

function loadBooks(query = '') {
    const author = authorSelect.value;
    const sortBy = document.getElementById('sort')?.value || 'title';
    const search = document.getElementById('searchInput')?.value?.toLowerCase() || query.toLowerCase();
    const container = document.querySelector('.book-grid');
    container.innerHTML = '';

    let filtered = books
        .filter(book => (currentGenre === 'Все' || book.genre === currentGenre))
        .filter(book => (author === 'Все' || book.author === author))
        .filter(book => book.title.toLowerCase().includes(search));

    filtered.sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.title.localeCompare(b.title);
    });

    filtered.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.cover}" alt="Обложка">
            <h3>${book.title}</h3>
            <p><strong>Автор:</strong> ${book.author}</p>
            <p><strong>Год:</strong> ${book.year}</p>
            <p><strong>Цена:</strong> ${book.price} ₽</p>
            <p><strong>Рейтинг:</strong> <span class="rating">${'★'.repeat(book.rating)}</span></p>
            <p>${book.description}</p>
            <div class="quantity-control">
                <button onclick='updateQuantity("${book.title}", -1)'>−</button>
                <span id='qty-${book.title}'>1</span>
                <button onclick='updateQuantity("${book.title}", 1)'>+</button>
            </div>
            <button onclick='addToCart("${book.title}")'>В корзину</button>
            <button onclick='addToFavorites("${book.title}")'>Отложить</button>
            <button onclick='showFragment("${book.title}")'>Фрагмент</button>
        `;
        card.addEventListener('click', () => recordViewed(book.title));
        container.appendChild(card);
    });
}

function showFragment(title) {
    const modal = document.getElementById('modal');
    const content = modal.querySelector('.modal-content p');
    content.innerHTML = `Фрагмент книги <strong>${title}</strong> (демо-содержимое).`;
    modal.style.display = 'flex';
}

function addToFavorites(title) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(title)) {
        favorites.push(title);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`Книга «${title}» добавлена в избранное.`);
    } else {
        alert(`Книга «${title}» уже в избранном.`);
    }
}

// Обновить данные книг с полями: price, rating, description
const books = [
    {
        title: "История революции",
        author: "Ли Ги Ён",
        genre: "История",
        year: 1987,
        isbn: "123-456-789",
        cover: "cover1.jpg",
        price: 350,
        rating: 4,
        description: "Фундаментальное исследование политических изменений в КНДР."
    },
    {
        title: "Путь независимости",
        author: "Хан Сория",
        genre: "Политика",
        year: 1972,
        isbn: "321-654-987",
        cover: "cover2.jpg",
        price: 420,
        rating: 5,
        description: "Анализ борьбы за независимость Кореи сквозь призму партийной литературы."
    },
    {
        title: "В тени горы Пэктусан",
        author: "Ли Ги Ён",
        genre: "Художественная литература",
        year: 1991,
        isbn: "456-789-123",
        cover: "cover3.jpg",
        price: 300,
        rating: 3,
        description: "Роман, раскрывающий быт и ментальность жителей Северной Кореи."
    }
];

function recordViewed(title) {
    let viewed = JSON.parse(localStorage.getItem('viewed')) || [];
    viewed = viewed.filter(t => t !== title);
    viewed.unshift(title);
    if (viewed.length > 5) viewed.pop();
    localStorage.setItem('viewed', JSON.stringify(viewed));
    renderViewed();
}

function renderViewed() {
    const viewed = JSON.parse(localStorage.getItem('viewed')) || [];
    const section = document.querySelector('.catalog-section .container');
    let block = document.getElementById('recently-viewed');
    if (!block) {
        block = document.createElement('div');
        block.id = 'recently-viewed';
        section.appendChild(block);
    }
    if (viewed.length > 0) {
        block.innerHTML = '<h3>Недавно просмотренные:</h3><ul>' +
            viewed.map(title => `<li>${title}</li>`).join('') + '</ul>';
    } else {
        block.innerHTML = '';
    }
}

function updateQuantity(title, delta) {
    const qtySpan = document.getElementById(`qty-${title}`);
    if (!qtySpan) return;
    let current = parseInt(qtySpan.textContent);
    current = Math.max(1, current + delta);
    qtySpan.textContent = current;
}

function addToCart(title) {
    const qty = parseInt(document.getElementById(`qty-${title}`).textContent);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item.title === title);

    if (index > -1) {
        cart[index].quantity += qty;
    } else {
        cart.push({ title, quantity: qty });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showPurchasePopup(title);
    highlightBook(title);
    renderCartInfo();
}

function showPurchasePopup(title) {
    const popup = document.createElement('div');
    popup.className = 'purchase-popup';
    popup.textContent = `Книга «${title}» добавлена в корзину.`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function highlightBook(title) {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        if (card.innerHTML.includes(title)) {
            card.style.backgroundColor = '#e0f7ff';
            setTimeout(() => card.style.backgroundColor = '', 1500);
        }
    });
}

function clearCart() {
    localStorage.removeItem('cart');
    renderCartInfo();
}

function renderCartInfo() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

function setupLanguageSwitcher() {
    const footer = document.querySelector("footer p");
    if (footer) {
        const langSwitcher = document.createElement("span");
        langSwitcher.innerHTML = `
            | <select id="language-select">
                <option value="RU">RU</option>
                <option value="EN">EN</option>
                <option value="KO">KO</option>
            </select>
        `;
        footer.appendChild(langSwitcher);

        document.getElementById("language-select").addEventListener("change", function (e) {
            const lang = e.target.value;
            alert("Язык интерфейса переключён на: " + lang + " (демо)");
        });
    }
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Корзина пуста. Добавьте книги перед оформлением заказа.");
        return;
    }

    // Получаем выбор оплаты и доставки
    const paymentMethod = prompt("Выберите способ оплаты: \n1 - Ввод номера карты (Tinkoff)\n2 - Перейти на PayPal\n3 - Перейти на ЮMoney", "1");
    const deliveryMethod = prompt("Выберите способ доставки: \n1 - Курьер по адресу\n2 - Почта по индексу", "1");

    let address = "";
    if (deliveryMethod === "1") {
        address = prompt("Введите адрес доставки:");
    } else {
        address = prompt("Введите почтовый индекс:");
    }

    if (!address) {
        alert("Адрес обязателен для доставки.");
        return;
    }

    // Вызываем карту для выбора местоположения (если подключено API)
    alert("Местоположение можно указать дополнительно через карту (не реализовано в демо).");

    // Обработка оплаты
    switch (paymentMethod) {
        case "1":
            const cardNumber = prompt("Введите номер карты:");
            if (!/^\d{16}$/.test(cardNumber)) {
                alert("Неверный формат номера карты.");
                return;
            }
            alert("Оплата через Tinkoff прошла успешно (демо). Заказ оформлен.");
            break;
        case "2":
            window.open("https://www.paypal.com/checkoutnow", "_blank");
            alert("Переход на PayPal выполнен. После оплаты вернитесь на сайт.");
            break;
        case "3":
            window.open("https://yoomoney.ru/quickpay", "_blank");
            alert("Переход на ЮMoney выполнен. После оплаты вернитесь на сайт.");
            break;
        default:
            alert("Выбран неверный способ оплаты.");
            return;
    }

    // Очистка корзины и переход
    clearCart();
    alert("Ваш заказ оформлен на адрес: " + address);
    window.location.href = '#catalog';
}