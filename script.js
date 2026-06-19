// 1. مصفوفة المنتجات الثابتة (تظهر عند كل الناس على أي جهاز فوراً بمجرد الرفع)
let initialProducts = [
    {
        id: 1,
        name: "قلم باركر فاخر عتيق",
        price: 4500,
        category: "pens",
        desc: "قلم باركر ملكي أصلي من الستينيات، بحالة ممتازة ومعاد صياغته ليناسب أصحاب الذوق الرفيع.",
        imgs: ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600"]
    },
    {
        id: 2,
        name: "ساعة أوميجا سويسرية نادرة",
        price: 25000,
        category: "watches",
        desc: "ساعة أوميجا أوتوماتيك عيار عتيق، تعمل بدقة متناهية مع سوار جلدي فاخر.",
        imgs: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600"]
    },
    {
        id: 3,
        name: "ولاّعة دنهيل مطلية بالذهب",
        price: 8500,
        category: "lighters",
        desc: "ولاعة دنهيل سويسرية معتقة تعمل بكفاءة عالية، قطعة كلاسيكية مميزة جداً.",
        imgs: ["https://images.unsplash.com/photo-1517454284617-6468b3f1159b?q=80&w=600"]
    }
];

// دمج المنتجات الثابتة مع أي منتجات مضافة محلياً للتجربة
let products = JSON.parse(localStorage.getItem('taga_products')) || initialProducts;
if (products.length === 0 && initialProducts.length > 0) {
    products = initialProducts;
}

let cart = null; 
let currentCategory = 'all';
let currentEditProductId = null; 

const productsContainer = document.getElementById('products-container');
const searchDropdown = document.getElementById('search-dropdown');

// دالة لتصحيح مسار الصور بروابط مباشرة أو محلياً
function fixImgPath(url) {
    if (!url) return "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600";
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    return `images/${url}`;
}

// رندر المنتجات مع حماية اللمس على الموبايل
function renderProducts(items) {
    if (!productsContainer) return;
    productsContainer.innerHTML = "";
    if(items.length === 0) {
        productsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; font-size: 15px; color:#aaa;'>لا توجد مقتنيات معروضة في هذا القسم حالياً ✨</p>";
        return;
    }
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const mainImg = fixImgPath(product.imgs && product.imgs[0] ? product.imgs[0] : "");
        
        card.innerHTML = `
            <img src="${mainImg}" alt="${product.name}" onclick="openProductModal(${product.id})">
            <div class="card-header-row">
                <h3 class="product-title" onclick="openProductModal(${product.id})">${product.name}</h3>
                <div class="action-buttons-container" style="display: flex; gap: 12px; align-items:center;">
                    <button class="btn-edit-prod" onclick="openEditProduct(event, ${product.id})" title="تعديل بيانات هذه القطعة" style="background: none; border: none; color: var(--gold-premium); cursor: pointer; font-size: 16px; padding: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-prod" onclick="deleteProduct(event, ${product.id})" title="حذف هذه القطعة" style="background: none; border: none; color: #ff4d5e; cursor: pointer; font-size: 16px; padding: 5px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div>
                <p class="product-price">${product.price.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <button class="btn-add-cart" onclick="selectForCheckout(${product.id})">اقتنِها الآن (شراء)</button>
        `;
        productsContainer.appendChild(card);
    });
}

// فتح نافذة تفاصيل المنتج المخصصة والمحسنة للموبايل واللمس
function openProductModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const sliderImg = document.getElementById('popup-img');
    const thumbnailsContainer = document.getElementById('popup-thumbnails');
    
    if(sliderImg) sliderImg.src = fixImgPath(product.imgs[0]);
    if(document.getElementById('popup-title')) document.getElementById('popup-title').innerText = product.name;
    if(document.getElementById('popup-price')) document.getElementById('popup-price').innerText = product.price.toLocaleString('ar-EG') + " ج.م";
    if(document.getElementById('popup-desc')) document.getElementById('popup-desc').innerText = product.desc || "قطعة فاخرة منتقاة بعناية من قِبل مكتبة طه حسب الله.";
    
    if(thumbnailsContainer) {
        thumbnailsContainer.innerHTML = "";
        product.imgs.forEach((imgUrl, index) => {
            const thumb = document.createElement('img');
            thumb.src = fixImgPath(imgUrl);
            if(index === 0) thumb.className = 'active';
            
            const changeImageEvent = function() {
                sliderImg.src = fixImgPath(imgUrl);
                document.querySelectorAll('.slider-thumbnails img').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
            thumb.onclick = changeImageEvent;
            thumb.ontouchstart = changeImageEvent;
            
            thumbnailsContainer.appendChild(thumb);
        });
    }
    
    const popupBtn = document.getElementById('popup-add-btn');
    if(popupBtn) {
        popupBtn.onclick = function() {
            selectForCheckout(product.id);
            closeProductModal();
        };
    }
    
    const modal = document.getElementById('product-detail-modal');
    if(modal) modal.style.display = 'flex';
}

function closeProductModal() { 
    const modal = document.getElementById('product-detail-modal');
    if(modal) modal.style.display = 'none'; 
}

function selectForCheckout(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    cart = product; 
    const countBadge = document.querySelector('.cart-count');
    if(countBadge) countBadge.innerText = "1";
    openCartModal();
}

function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const listContainer = document.getElementById('cart-items-list');
    const formSection = document.getElementById('checkout-form-section');
    if(!cartModal || !listContainer || !formSection) return;

    if (!cart) {
        listContainer.innerHTML = "<p style='text-align:center; padding:20px;'>حقيبة المشتريات فارغة تماماً.</p>";
        formSection.style.display = "none";
    } else {
        listContainer.innerHTML = `
            <div style="display:flex; gap:15px; align-items:center; background:rgba(197,168,128,0.1); padding:10px; border-radius:8px;">
                <img src="${fixImgPath(cart.imgs[0])}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
                <div>
                    <h4 style="margin:0; font-size:14px;">${cart.name}</h4>
                    <p style="margin:5px 0 0 0; color:var(--gold-premium); font-weight:bold;">${cart.price.toLocaleString('ar-EG')} ج.م</p>
                </div>
            </div>
        `;
        formSection.style.display = "block"; 
    }
    cartModal.style.display = 'flex';
}

function closeCartModal() { 
    const modal = document.getElementById('cart-modal');
    if(modal) modal.style.display = 'none'; 
}

function validateInputsAndOpenTerms() {
    const name = document.getElementById('client-name').value.trim();
    const phone1 = document.getElementById('client-phone1').value.trim();
    const address = document.getElementById('client-address').value.trim();

    if (!name || !phone1 || !address) {
        alert("تنبيه: من فضلك، املأ كافة البيانات الإلزامية (الاسم، الهاتف الأساسي، العنوان).");
        return;
    }

    closeCartModal();
    const termsModal = document.getElementById('terms-modal');
    if(termsModal) termsModal.style.display = "flex";
    
    const confirmBtn = document.getElementById('btn-confirm-final');
    if(confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "🔒 يجب قراءة الشروط بالكامل للتفعيل...";
    }
    const scrollable = document.getElementById('terms-text-scrollable');
    if(scrollable) scrollable.scrollTop = 0;
}

function handleTermsScroll() {
    const container = document.getElementById('terms-text-scrollable');
    const confirmBtn = document.getElementById('btn-confirm-final');
    if(!container || !confirmBtn) return;
    
    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 8) {
        confirmBtn.disabled = false;
        confirmBtn.innerText = "إرسال طلب الشراء الرسمي عبر واتساب 🚀";
    }
}

function closeTermsModal() { 
    const modal = document.getElementById('terms-modal');
    if(modal) modal.style.display = 'none'; 
}
function openPureTermsModal() { 
    const modal = document.getElementById('pure-read-terms-modal');
    if(modal) modal.style.display = 'flex'; 
}
function closePureTermsModal() { 
    const modal = document.getElementById('pure-read-terms-modal');
    if(modal) modal.style.display = 'none'; 
}

function sendOrderToWhatsApp() {
    const name = document.getElementById('client-name').value.trim();
    const phone1 = document.getElementById('client-phone1').value.trim();
    const phone2 = document.getElementById('client-phone2').value.trim() || "غير متوفر";
    const address = document.getElementById('client-address').value.trim();

    const message = `✨ *طلب شراء جديد من مكتبة طه حسب الله* ✨%0A%0A`
                  + `📦 *المنتج المطلـوب:* ${cart.name}%0A`
                  + `💰 *إجمالي السعـــر:* ${cart.price.toLocaleString('ar-EG')} ج.م%0A%0A`
                  + `👤 *اسم العميــــــل:* ${name}%0A`
                  + `📱 *رقم الهاتف الأول:* ${phone1}%0A`
                  + `📞 *رقم الهاتف الثاني:* ${phone2}%0A`
                  + `📍 *عنوان الشحـــن:* ${address}%0A%0A`
                  + `📝 *الحالة:* وافق العميل على كافة سياسات وشروط الشراء الفوري.%0A%0A`
                  + `⚙️ _تم تأكيد الطلب بنجاح._`;

    const ownerWhatsAppNumber = "201080768225";
    window.open(`https://wa.me/${ownerWhatsAppNumber}?text=${message}`, '_blank');
    
    cart = null;
    const badge = document.querySelector('.cart-count');
    if(badge) badge.innerText = "0";
    const modal = document.getElementById('terms-modal');
    if(modal) modal.style.display = "none";
    alert("تم توجيه طلبك بنجاح!");
}

const adminModal = document.getElementById('admin-modal');
function openAdminPanel() { 
    currentEditProductId = null; 
    if(document.getElementById('admin-modal-title')) document.getElementById('admin-modal-title').innerText = "إضافة قطعة ملكية جديدة";
    if(document.getElementById('btn-admin-submit')) document.getElementById('btn-admin-submit').innerText = "إضافة القطعة للمكتبة ✨";
    if(adminModal) adminModal.style.display = 'flex'; 
}
function closeAdminPanel() { if(adminModal) adminModal.style.display = 'none'; }

function openEditProduct(event, productId) {
    event.stopPropagation();
    const confirmPass = prompt("أدخل الرقم السري للمالك لتعديل بيانات المنتج:");
    if (confirmPass !== "TAGA2026") { alert("الرمز خاطئ!"); return; }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentEditProductId = productId; 
    
    if(document.getElementById('prod-name')) document.getElementById('prod-name').value = product.name;
    if(document.getElementById('prod-price')) document.getElementById('prod-price').value = product.price;
    if(document.getElementById('prod-cat')) document.getElementById('prod-cat').value = product.category;
    if(document.getElementById('prod-desc')) document.getElementById('prod-desc').value = product.desc || "";
    if(document.getElementById('prod-img')) document.getElementById('prod-img').value = product.imgs[0] || "";
    if(document.getElementById('prod-img2')) document.getElementById('prod-img2').value = product.imgs[1] || "";
    if(document.getElementById('prod-img3')) document.getElementById('prod-img3').value = product.imgs[2] || "";
    
    if(document.getElementById('admin-modal-title')) document.getElementById('admin-modal-title').innerText = "تعديل بيانات القطعة الحالية";
    if(document.getElementById('btn-admin-submit')) document.getElementById('btn-admin-submit').innerText = "حفظ التعديلات الفورية 💾";
    
    if(adminModal) adminModal.style.display = 'flex';
}

function handleAdminAction() {
    const pass = document.getElementById('admin-password').value;
    if(pass !== "TAGA2026") { 
        alert("خطأ: الرمز السري غير صحيح!");
        return;
    }
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-cat').value;
    const desc = document.getElementById('prod-desc').value.trim();
    const img1 = document.getElementById('prod-img').value.trim();
    const img2 = document.getElementById('prod-img2').value.trim();
    const img3 = document.getElementById('prod-img3').value.trim();
    
    if(!name || !price || !img1) { alert("من فضلك املأ الحقول الأساسية الاسم والسعر والرابط الأول."); return; }

    let imgsArray = [img1];
    if(img2) imgsArray.push(img2);
    if(img3) imgsArray.push(img3);

    if (currentEditProductId !== null) {
        const prodIndex = products.findIndex(p => p.id === currentEditProductId);
        if (prodIndex !== -1) {
            products[prodIndex].name = name;
            products[prodIndex].price = price;
            products[prodIndex].category = category;
            products[prodIndex].desc = desc;
            products[prodIndex].imgs = imgsArray;
            alert("تم تعديل تفاصيل القطعة بنجاح في متصفحك الحالي!");
        }
    } else {
        const newProd = { id: Date.now(), name, price, category, desc, imgs: imgsArray };
        products.push(newProd);
        alert("تم إضافة القطعة بنجاح في متصفحك الحالي!");
    }
    
    localStorage.setItem('taga_products', JSON.stringify(products));
    filterCategory(currentCategory);
    closeAdminPanel();
    
    document.getElementById('prod-name').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-desc').value = "";
    document.getElementById('prod-img').value = "";
    document.getElementById('prod-img2').value = "";
    document.getElementById('prod-img3').value = "";
    document.getElementById('admin-password').value = "";
}

function deleteProduct(event, productId) {
    event.stopPropagation(); 
    const confirmPass = prompt("أدخل الرقم السري للمالك لتأكيد الحذف النهائي:");
    if (confirmPass !== "TAGA2026") { alert("الرمز خاطئ!"); return; }
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('taga_products', JSON.stringify(products));
    alert("تم حذف القطعة محلياً.");
    filterCategory(currentCategory);
}

function filterCategory(category) {
    currentCategory = category;
    if(category === 'all') renderProducts(products);
    else renderProducts(products.filter(p => p.category === category));
}

if(document.getElementById('main-search')) {
    document.getElementById('main-search').addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        
        if (keyword === "") {
            searchDropdown.innerHTML = "";
            searchDropdown.style.display = "none";
            return;
        }
        
        const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
        searchDropdown.innerHTML = "";
        
        if(filtered.length === 0) {
            searchDropdown.innerHTML = `<p class="search-no-results">لا توجد مقتنيات مطابقة لـ "${keyword}"</p>`;
        } else {
            filtered.forEach(product => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                const itemImg = fixImgPath(product.imgs && product.imgs[0] ? product.imgs[0] : "");
                
                item.innerHTML = `
                    <img src="${itemImg}" alt="${product.name}">
                    <div class="search-result-info">
                        <p class="search-result-name">${product.name}</p>
                        <p class="search-result-price">${product.price.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                `;
                
                item.onclick = function() {
                    openProductModal(product.id);
                    document.getElementById('main-search').value = "";
                    searchDropdown.style.display = "none";
                };
                searchDropdown.appendChild(item);
            });
        }
        searchDropdown.style.display = "block";
    });
}

document.addEventListener('click', (e) => {
    if (searchDropdown && !e.target.closest('.search-container')) {
        searchDropdown.style.display = "none";
    }
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

if(document.getElementById('theme-toggle')) {
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('light-mode')) {
            this.className = 'fas fa-sun';
            this.title = 'تبديل الوضع الليلي';
        } else {
            this.className = 'fas fa-moon';
            this.title = 'تبديل الوضع المضيء';
        }
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length <= 1) return;
    
    let currentSlideIndex = 0;
    setInterval(() => {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 4000); 
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts(products);
    initHeroSlider();
});