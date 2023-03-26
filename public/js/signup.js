import axios from 'axios'
import { showAlert } from './alerts'

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Signed up succsessfully!')
            window.setTimeout(() => {
                location.assign('/me')
            }, 1500)
        }
        console.log(res);
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}
