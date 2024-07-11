export function setToken(userData){
    localStorage.setItem('authToken', JSON.stringify(userData));
}

export function getToken(){
    const userData = localStorage.getItem('authToken');
    return userData ? JSON.parse(userData) : null;

}

export function removeToken(){
    localStorage.removeItem('authToken');
}