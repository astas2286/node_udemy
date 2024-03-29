import axios from 'axios'
import { showAlert } from './alerts'

export const signup = async (name, email, password, passwordConfirm) => {
    try {
      console.log(process.env.NODE_ENV)
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      },
      withCredentials: true,
    })

    if (res.status === 201) {
      showAlert('success', 'Signed Up Successfully!')
      window.setTimeout(() => {
        location.assign('/')
      }, 1100)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}
