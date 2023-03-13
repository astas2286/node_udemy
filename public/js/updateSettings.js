import axios from 'axios'
import { showAlert } from './alerts'

export const updateData = async (name, email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:8000/api/v1/users/updateMe/',
            data: {
                name,
                email
            }
        })

        if (res.data.status = 'success') {
            showAlert('success', 'Data updated succsessfully!')
        }
        console.log(res);
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}