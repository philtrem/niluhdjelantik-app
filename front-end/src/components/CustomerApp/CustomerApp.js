import React, { Component } from 'react';
import './CustomerApp.css';
import ListItems from './ListItems'
class CustomerApp extends Component {
	render() {
		return (
			<div className="customer-app">
				<div className="customer-app-header">
					<h1 className="customer-app-headerText"> NILUH DJELANTIK </h1>
				</div>
				<div className="customer-app-nav-section">

				</div>
				<div className="customer-app-app-section" >
					<ListItems/>
				</div>
			</div>
		)
	}
}

export default CustomerApp;