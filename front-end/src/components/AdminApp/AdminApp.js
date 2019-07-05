import React, {Component} from 'react'
import Cookies from "js-cookie"
import './AdminApp.css'
import LoginForm from '../Authentication/LoginForm'
import CreateItem from './CreateItem/CreateItem'
import ManageItems from './ManageItems/ManageItems'

class AdminApp extends Component {
  state = {
    selectedApp: "create-listings",
    isAuthenticated: true,
  }
  updateAuthStatus() {
    fetch("/checkAuthStatus/")
      .then(res => (
      res.json()
        )
      )
      .catch(error => {
        this.setState({
          isAuthenticated: false
        })
        console.log(`Fetch error ${error}`)
      })
      .then(json => {
          this.setState({
            isAuthenticated: json.authenticated || false
          })
        }
      )
  }
  signOut(buttonElem) {
    this.buttonAction.call(this, buttonElem)
    Cookies.remove("sessionId")
    this.setState({
      isAuthenticated: false,
    })
  }
  fetchItems = (query) => {
    return fetch("/" + query + ".json")
      .then(res => (
        res.json()
      ))
      .catch(error => {
        console.log(`Fetch error: ${error}`)
      })
      .then(json => (
        json
      ))
  }
  loadComponent() {
    const updateAuthStatus = this.updateAuthStatus.bind(this)
    if (!this.state.isAuthenticated) {
      return (
        <LoginForm updateAuthStatus={updateAuthStatus}/>
      )
    }
    const selectedApp = this.state.selectedApp
    switch(selectedApp) {
      case "create-listings":
        return (
          <CreateItem fetchItems={this.fetchItems}/>
        )
      case "manage-listings":
        return (
          <ManageItems fetchItems={this.fetchItems}/>
        )
      default:
      // do nothing
    }
  }
  selectApp(id) {
    this.setState({
      selectedApp: id
    })
  }
  buttonAction(elem) {
    // button-click animation
    elem.style.borderStyle = "inset"
    setTimeout(() => (
      elem.style.borderStyle = "outset"
    ), 100)
    // switch app
    if (elem.id) {
      this.selectApp(elem.id)
    }
  }
  componentDidMount() {
    this.updateAuthStatus()
  }
  render() {
    const {isAuthenticated} = this.state
    const buttonAction = this.buttonAction.bind(this)
    const loadComponent = this.loadComponent.bind(this)
    const signOut = this.signOut.bind(this)
    return (
				<div className="App">
					<div className="header">
						<h1 className="headerText"> NILUH DJELANTIK </h1>
					</div>
					<div className="nav-section">
						<div className="nav-tab" id="create-listings"
								 onClick={(e) => (buttonAction(e.target))}
						> Create Listings
						</div>
						<div className="nav-tab" id="manage-listings"
								 onClick={(e) => (buttonAction(e.target))}
						> View/Edit Listings</div>
            {isAuthenticated &&
              <div className="nav-tab sign-out"
                   onClick={e => signOut(e.target)}
              > Sign Out </div>
            }
					</div>
					<div className="app-section" >
						{loadComponent()}
					</div>
				</div>
    )
  }
}

export default AdminApp
