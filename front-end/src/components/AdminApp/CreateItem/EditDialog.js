import React, {Component} from 'react';
import './EditDialog.css'

class EditDialog extends Component {
  state = {
    items: this.props.items.slice(), // clone array
    prevItems: this.props.items.slice(), // clone array
    mutated: false,
    saved: false
  }
  addItem(e) {
    e.preventDefault()
    const value = this.refs.input.value
    const {items} = this.state
    // returns if value already exists
    if (items.includes(value) || value === "") {
      return
    }
    items.push(value)
    items.sort((a,b) => (
      a.toLowerCase().localeCompare(b.toLowerCase())
    ))
    this.setState({
      items,
      mutated: true,
      saved: false
    })
    this.refs.input.value = ""
  }
  removeItem(value) {
    const result = this.state.items.filter(elem => (
      elem !== value
    ))
    this.setState({
      items: result,
      mutated: true,
      saved: false
    })
  }
  hideExitDialog(e, id) {
    e.preventDefault()
    this.refs.exitDialog.style.display = "none"
    if (id === "yes") {
      this.props.hideEditDialog(this.props.selected)
      this.setState({
        items: this.state.prevItems.slice() // clone array
      })
    }
  }
  exit() {
    const {mutated, saved} = this.state
    const {selected} = this.props
    if (mutated) {
      if (!saved) {
        this.refs.exitDialog.style.display = "block"
      } else {
        this.props.hideEditDialog(selected)
        this.setState({
          mutated: false,
          saved: false
        })
      }
    }
    else {
      this.props.hideEditDialog(selected)
    }
  }
  persistData(e, field) {
    e.preventDefault()
    this.props.updateState(field, this.state.items)
    this.setState({
      prevItems: this.state.items.slice(), // clone array
      saved: true,
    })
    fetch(`/update/${field}/`, {
      method: "POST",
      body: JSON.stringify(this.state.items),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    })
      .then(res => (
        res.json()
      ))
      .catch(error => {
        // n.b: an error is expected but it's inconsequential
        console.log(`Fetch error: ${error}`)
      })
  }
  render() {
    const {selected} = this.props
    const {items} = this.state
    const addItem = this.addItem.bind(this)
    const removeItem = this.removeItem.bind(this)
    const exit = this.exit.bind(this)
    const hideExitDialog = this.hideExitDialog.bind(this)
    const persistData = this.persistData.bind(this)
    return (
      <div className="edit-dialog-main">
        <div>
          <div ref="exitDialog"
               className="edit-dialog-exit-dialog"
          >
            <p> Exit without saving ? </p>
            <button id="exit-yes"
                    className="edit-dialog-exit-dialog-buttons"
                    onClick={(e) => (hideExitDialog(e, "yes"))}
            > yes </button>
            <button id="exit-no"
                    className="edit-dialog-exit-dialog-buttons"
                    onClick={(e) => (hideExitDialog(e, "no"))}

            > no </button>
          </div>
          <div className="edit-dialog-title-bar">
            <span className="edit-dialog-title"> {selected + "s"} </span>
            <div className="edit-dialog-close"
                 onClick={() => {exit()}}
            > x </div>
          </div>
          <div className="edit-dialog-input-container">
            <input type="text" spellCheck="false" ref="input"
                   className="edit-dialog-input"
            />
            <button className="edit-dialog-add"
                    onClick={e => (addItem(e))}
            > Add
            </button>
          </div>
        </div>

        <div className="edit-dialog-list-box">
          <ul className="edit-dialog-list">
            {items.map(item => (
              <div key={item}>
                <li className="edit-dialog-list-item"
                > {item} </li>
                <span id={item} className="edit-dialog-list-item-remove"
                      onClick={(e) => (removeItem(e.target.id))}
                > x </span>
              </div>
            ))}
          </ul>
        </div>
        <button className="edit-dialog-save"
                type="submit"
                onClick={(e) => (persistData(e, selected + "s"))}
        > Save </button>
      </div>
    )
  }
}

export default EditDialog