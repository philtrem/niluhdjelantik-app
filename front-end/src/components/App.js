import React, {Component} from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import './App.css'
import AdminApp from "./AdminApp/AdminApp"
import CustomerApp from "./CustomerApp/CustomerApp"

class App extends Component {
	render() {
		return (
			<Router>
				<React.Fragment>
					<Route path="/admin" component={AdminApp}/>
					<Route path="/app" component={CustomerApp}/>
				</React.Fragment>
			</Router>
		)
	}
}

export default App