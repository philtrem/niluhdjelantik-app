import React, {Component} from 'react'
import CreateItemForm from './CreateItemForm'
import MessageBox from '../shared/Messages/MessageBox'
import './CreateItem.css'

class CreateItem extends Component {
  state = {
    messageBoxToggled: false,
  }
  toggleMessageBox() {
    this.setState(prevState => ({
      messageBoxToggled: !prevState.messageBoxToggled
    }))
  }
  render() {
    const toggleMessageBox = this.toggleMessageBox.bind(this)
    const {fetchItems} = this.props
    const {messageBoxToggled} = this.state
    return (
      <div className="create-item-container">
        {
          messageBoxToggled
          && <MessageBox options={{
            message: "Listing successfully created",
            messageType: "success",
          }}/>
        }
        <CreateItemForm fetchItems={fetchItems} toggleMessageBox={toggleMessageBox}/>
      </div>
    )
  }
}

export default CreateItem