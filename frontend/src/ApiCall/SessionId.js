function getCookie(name) {
    // Verifica se o cookie está disponível
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        console.log(cookies)
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica se o cookie começa com o nome que estamos procurando
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    // Se não encontrar nos cookies, verifica no localStorage
    if (cookieValue === null) {
        cookieValue = localStorage.getItem(name);
        console.log("LOCAL", cookieValue)
    }

    // Se não encontrar no localStorage, verifica no sessionStorage
    if (cookieValue === null) {
        cookieValue = sessionStorage.getItem(name);
        console.log("SESSION", cookieValue)

    }

    return cookieValue;
}

const sessionId = getCookie('sessionid');
console.log(sessionId)
export default sessionId;