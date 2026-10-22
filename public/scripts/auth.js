const $ = (el) => document.querySelector(el)

const $loginForm = $('#login-form')
const $loginMessage = $('#login-form .message')
const $registerForm = $('#register-form')
const $registerMessage = $('#register-form .message')

function showMessage($el, text, color){
    $el.textContent = text;
    $el.style.color = color
}

async function postJSON (url, body){
    const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    const data = await res.json()
    return {ok: res.ok, data}
}

$loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const username = $('#login-username').value;
    const password = $('#login-password').value;

    try{
        const {ok, data} = await postJSON('/auth/login', {username, password})

        if(!ok) {
            showMessage($loginMessage, data.error ?? 'Error al iniciar sesion', 'var(--oxblood)');
            return 
        }

        showMessage($loginMessage, 'Sesion Iniciada', 'var(--black)')
        window.location.href = '/catalog'
    } catch(e){
        console.error(e)
        showMessage($loginMessage, 'Error al iniciar Sesion', 'var(--oxblood)')
    }
})

$registerForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const username = $('#register-username').value;
    const password = $('#register-password').value;
    const confirm = $('#register-confirm').value

    if(password !== confirm){
        showMessage($registerMessage, 'Las contraseñas no coinciden', 'var(--oxblood)')
    }

    try{
        const register = await postJSON('/auth/register', {username, password})

        if(!register.ok){
            showMessage($registerMessage, register.data.error ?? 'Error al registrarse', 'var(--oxblood)')
            return
        }

        const login = await postJSON('/auth/login', {username, password})

        if(login.ok){
            window.location.href = '/catalog'
        } else {
            showMessage($registerMessage, 'Registrado correctamente', 'var(--black)')
        }
    } catch(err){
        console.error(err)
        showMessage($registerMessage, 'Error al registrarse', 'var(--oxblood)')
    }
})