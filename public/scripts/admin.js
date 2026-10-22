const $ = (el)=>document.querySelector(el)

async function request(url,method,body){
    const res = await fetch(url,{
        method,
        headers: {'Content-Type': 'application/json'},
        body: body ? JSON.stringify(body) : undefined
    })

    const data = await res.json()
    return {ok: res.ok, data}
}

async function uploadImage(file){
    const body = new FormData()
    body.append('image', file)

    // Sin Content-Type: el navegador lo completa solo para archivos
    const res = await fetch('/uploads', {method:'POST', body})
    const data = await res.json().catch(()=>{})

    if(!res.ok) throw new Error(data.error ?? 'No se pudo subir la imagen')
    return data.url
}

//Crear producto

$('#product-form').addEventListener('submit', async (e)=>{
    e.preventDefault()
    const form = new FormData(e.target)

    try{
        const file = form.get('image')
        const image_url = file && file.size > 0 ? await uploadImage(file) : ''

        const {ok, data} = await request('/products', 'POST', {
            name: form.get('name'),
            description: form.get('description'),
            price: Number(form.get('price')),
            stock: Number(form.get('stock')),
            image_url
        })

        if(!ok) return alert(data.error ?? 'Error al crear el producto')
        window.location.reload()
    } catch(err){
        alert(err.message)
    }

})

// Guardar / borrar producto (delegación de eventos sobre la tabla)

$('#products-table').addEventListener('click', async(e)=>{
    const $row = e.target.closest('tr')
    if(!$row) return

    const id = $row.dataset.id

    if(e.target.classList.contains('save-btn')){
        try {
            const file = $row.querySelector('.f-file').files[0]
            const image_url = file ? await uploadImage(file) : $row.querySelector('.f-image').value

            const { ok, data } = await request(`/products/${id}`, 'PATCH', {
                name: $row.querySelector('.f-name').value,
                description: $row.querySelector('.f-description').value,
                price: Number($row.querySelector('.f-price').value),
                stock: Number($row.querySelector('.f-stock').value),
                image_url
            })

            alert(ok ? 'Producto actualizado' : (data.error ?? 'Error al guardar'))
            if (ok && file) window.location.reload()   // para ver la foto nueva
        } catch (err) {
            alert(err.message)
        }
    }

    if(e.target.classList.contains('delete-btn')){
        if(!confirm('¿Borrar este producto?')) return

        const {ok, data} = await request (`/products/${id}`, 'DELETE')
        if(!ok) return alert(data.error ?? 'Error al eliminar el producto')
        $row.remove()
    }
})

// Cambiar estado de una orden

document.addEventListener('change', async (e)=>{
    if(!e.target.classList.contains('status-select')) return

    const id = e.target.closest('.order').dataset.id
    const {ok, data} = await request (`/orders/${id}/status`, 'PATCH', { status : e.target.value})

    if(!ok) alert(data.error ?? 'Error al actualizar el estado')
}) 