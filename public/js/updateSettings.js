import axios from 'axios'
import { showAlert } from './alerts'

// type is for "password" or "data"
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password'
            ? '/api/v1/users/updateMyPassword'
            : '/api/v1/users/updateMe'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if (res.data.status = 'success') {
            showAlert('success', `${type} updated succsessfully!`)
        }

    } catch (error) {
        showAlert('error', error.response.data.message)
    }
}

// Cast to ObjectId failed for value "updateMyPassword" (type string) at path "_id" for model "User"