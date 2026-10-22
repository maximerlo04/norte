const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el)

const $cartButton = $('#cart-button')
const $cartItems = $('#cart-items')
const $cartPanel = $('#cart-panel')
const $cartCount = $('#cart-count')
const $cartTotal = $('#cart-total')
const $checkoutButton = $('#checkout-btn')
const $logoutButton = $('#logout-btn')
const $cartClose = $('#cart-close')
const $cartOverlay = $('#cart-overlay')

function getCart () {
    return JSON.parse(localStorage.getItem("cart") ?? '[]');
}

function renderCart(){
    const cart = getCart()

    $cartItems.innerHTML = cart.map(item => `
        <li data-id="${item.id}">
            <span>${item.name} x${item.quantity}</span>
            <span>$${item.price * item.quantity}
                <button class="remove-btn">✕</button>
            </span>
        </li>    
    `).join('')

    const total = cart.reduce((sum,item)=> sum + item.price * item.quantity, 0)
    const count = cart.reduce((sum,item)=> sum + item.quantity, 0)

    $cartTotal.textContent = total.toLocaleString('es-AR', { minimumFractionDigits: 2 })
    $cartCount.textContent = count
}


function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart))
    renderCart()
}

function addToCart(product){
    const cart = getCart()
    const existing = cart.find( item => item.id === product.id)

    if(existing){
        existing.quantity++;
    }
    else{
        cart.push({...product, quantity: 1})
    }

    saveCart(cart);
}

function removeFromCart (id) {
    const cart = getCart().filter(item=>item.id !== id)
    saveCart(cart)
}

$$('.add-btn').forEach($btn =>{
    $btn.addEventListener('click', ()=>{
        const $card = $btn.closest('.product-card')
        addToCart({
            id: $card.dataset.id,
            name: $card.querySelector('h3').textContent,
            price: parseFloat($card.dataset.price)
        })
    })
})

// Abrir/cerrar panel del carrito
function openCart() {
    $cartPanel.classList.remove('hidden')
    $cartOverlay.classList.remove('hidden')
    $cartClose.focus()
}

function closeCart() {
    $cartPanel.classList.add('hidden')
    $cartOverlay.classList.add('hidden')
    $cartButton.focus()
}

$cartButton.addEventListener('click', openCart)
$cartClose.addEventListener('click', closeCart)
$cartOverlay.addEventListener('click', closeCart)

document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') return closeCart()
})

// Quitar producto (delegación de eventos)
$cartItems.addEventListener('click', (e)=>{
    if (!e.target.classList.contains('remove-btn')) return
    const id = e.target.closest('li').dataset.id
    removeFromCart(id)
})

$logoutButton?.addEventListener('click', async ()=>{
    await fetch('/auth/logout', {method: 'POST'})
    window.location.reload()
})

// Checkout: acá recién se manda al servidor
$checkoutButton.addEventListener('click', async ()=>{
    const cart = getCart()

    if(cart.length === 0){
        alert('El carrito esta vacio')
        return
    }

    try{
        const res = await fetch("/orders", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: cart.map(item=>({productId: item.id, quantity: item.quantity}))
            })
        })

        if(res.status === 401){
            alert('Tenes que iniciar sesion para comprar')
            window.location.href = '/login'
            return
        }

        const data = await res.json();

        if(!res.ok){
            alert(data.error ?? 'Error al procesar la compra')
            return
        }

        localStorage.removeItem('cart')
        alert('Compra finalizada')
        window.location.href = "/orders"
    } catch(e){
        console.error(e)
        alert('No se pudo conectar con el servidor')
    }
})



renderCart()

