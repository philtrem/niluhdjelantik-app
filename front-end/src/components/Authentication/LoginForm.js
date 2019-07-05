import React, {Component} from 'react'
import './LoginForm.css'

class LoginForm extends Component {
  state = {
    isSuccessful: false,
    showMessage: false,
    message: "",
    username: "",
    password: "",
  }
  authenticate(e) {
    e.preventDefault()
    const updateAuthStatus = this.props.updateAuthStatus
    const formData = new FormData()
    formData.append("username", this.state.username)
    formData.append("password", this.state.password)
    fetch("/login", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .catch(error => (
        console.log(error)
      ))
      .then(json => {
        if (json === undefined) {
          this.setState({
            showMessage: true,
            message: "server unreachable",
          })
          return
        }
        if (json.successful) {
          updateAuthStatus()
        } else {
          this.setState({
            showMessage: true,
            message: "incorrect username or password",
          })
        }
      })
  }
  render() {
    const authenticate = this.authenticate.bind(this)
    const {showMessage, message} = this.state
    return (
      <div className="login-form-container">
        <p className="login-form-header"> Proceed to log in </p>
        <form className="login-form" autoCorrect="false">
          <p> Username </p>
          <input type="text" spellCheck="false"
                 onChange={e => {
                   this.setState({
                     username: e.target.value
                   })
                 }}
          />
          <p> Password </p>
          <input className="login-form-password" type="password"
                 onChange={e => {
                   this.setState({
                     password: e.target.value
                   })
                 }}
          />
          <button className="login-form-submit" type="submit"
                  onClick={e => (authenticate(e))}
          > Log in </button>
        </form>
        {
          showMessage &&
          <p className="login-form-message"> {message} </p>
        }
      </div>
    )
  }
}

export default LoginForm