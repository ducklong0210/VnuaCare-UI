import {userManagerRouter} from '../../../utils/api-router.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// lấy header

function getAuthHeaders(){
    const token = localStorage.getItem('accessToken')
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

// laasy danh sach nguoi dung

export async function getUserFilterApi({page = 1, size = 10, keyword = '', role = ''} = {} ){
    const params = new URLSearchParams()

    if(page) params.set('page', page)
    if(size) params.set('size', size)
    if(keyword) params.set('keyword', keyword)
    if(role) params.set('role', role)

    const queryString = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(
        `${API_BASE_URL}${userManagerRouter.getAll}?${queryString}`,{
            method: 'GET',
            headers: getAuthHeaders()
        }
    )
    const result = await response.json()

    return result.data
}

// tạo người dùng

// export async function CreateUserApi(userData){
    
// }
