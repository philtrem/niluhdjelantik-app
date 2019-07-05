import React, {Component} from 'react'
import Dropdown from '../shared/Dropdown'
import './EditItemForm.css'

class EditItemForm extends Component {
  state = {
    boxNumber: this.props.itemData.boxNumber || "",
    price: this.props.itemData.price || "",
    quantity: this.props.itemData.sizesCount.slice(), // clone array
    formData: Object.assign({}, this.props.itemData) // clone object
  }
  sizes = [34, 35, 36, 37, 38, 39, 40, 41]
	isPriceValid(price) {
		if (price === "" ) {
			return false
		}
		if (price[0] === ",") {
			return false
		}
		if (price.length > 5) {
			return false
		}
		const validChars = ["0","1","2","3","4",
			"5", "6","7","8","9","10", ","]
		let count = 0
		for (let i = 0; i < price.length; i++) {
			if (price[i] === ",") {
				count++
			}
			if (!validChars.includes(price[i])) {
				return false
			}
		}
		return count <= 1
	}
  setInput(field, value) {
		if (field === "price") {
			if (this.isPriceValid(value)) {
				const splitValue = value.split(",")
				if (splitValue.length < 3) {
					if (value.includes(",")) {
						value = splitValue.join("")
					}
				}
				if (value.length > 3) {
					value = value.split(",").join("")
					value = [value[0], ",", value.substring(1)].join("")
				}
				this.setState({
					[field]: value,
				})
			}
		}
	}
  setQuantity(i, value) {
    const {quantity} = this.state
    quantity[i] = value
    this.setState({
      quantity
    })
  }
  setFormValue(field, value) {
    if (field) {
      const {formData} = this.state
      if (field === "sizesCount") {
        const sizesCount = value
        let count = 0
        sizesCount.forEach(val => {
          count += Number(val)
        })
        formData["quantity"] = String(count)
      }
      formData[field] = value
      this.setState({
        formData
      })
    }
  }
  validateForm() {
    const formData = this.state.formData
    const required = ["id", "type", "price", "sizesCount", "boxNumber", "imageURL"]
    for (let i = 0; i < required.length; i++) {
      const key = required[i]
      if (!formData[key]) {
        return false
      }
    }
    return true
  }
  submitForm(e) {
    e.preventDefault()
    if (!this.validateForm()) {
      console.log("form not validated")
      return
    }
    let form = new FormData()
    const formData = this.state.formData
    const smallestSize = this.sizes[0]
    let sizes = []
    formData.sizesCount.forEach((count, i) => {
      Number(count) > 0 && sizes.push(String(i + smallestSize))
    })
    formData.sizes = sizes
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key])
    })
    const request = new XMLHttpRequest()
    request.open("POST", "/updateItem")
    request.send(form)

    const {toggleEdit, toggleMessageBox, updateListings} = this.props
    updateListings(formData)
    toggleEdit()
    toggleMessageBox("Update Successful", "success")
    setTimeout(toggleMessageBox, 750)
  }
  render() {
    const {itemData, toggleEdit,
      types} = this.props
    const {boxNumber, price, quantity, formData} = this.state
    const setInput = this.setInput.bind(this)
    const setQuantity = this.setQuantity.bind(this)
    const setFormValue = this.setFormValue.bind(this)
    const submitForm = this.submitForm.bind(this)
    const sizes = this.sizes
    return (
      <div className="manage-items-edit-item-main">
        <div className="manage-items-edit-item-title-bar">
          <span className="manage-items-edit-item-title"> Edit Item </span>
          <div className="manage-items-edit-item-close"
               onClick={() => toggleEdit()}
          > x </div>
        </div>
        <React.Fragment>
          <p className="manage-items-edit-item-label"> Model </p>
          <p className="manage-items-edit-item-text"> {itemData.model} </p>
          <p className="manage-items-edit-item-label"> Color </p>
          <p className="manage-items-edit-item-text"> {itemData.color} </p>
          <p className="manage-items-edit-item-label"> Type </p>
          <Dropdown field={"type"}
                    values={types}
                    selected={itemData.type}
                    setFormValue={setFormValue}
          />
					<p className="manage-items-edit-item-label"> Price </p>
					<div className="manage-items-edit-item-price-row">
						<p className="manage-items-edit-item-price-affix"> IDR </p>
						<input type="text"
									 className="manage-items-edit-item-price-input"
									 autoComplete="false"
									 autoCorrect="false"
									 spellCheck="false"
									 value={price}
									 onChange={e => (setInput("price", e.target.value))}
									 onBlur={() => (setFormValue("price", price))}
						/>
						<p className="manage-items-edit-item-price-affix"> ,000.00 </p>
					</div>
          <p className="manage-items-edit-item-label"> Quantity </p>
          <div className="manage-items-edit-item-sizes-form">
            {sizes.map((size, i) => (
              <div class="manage-items-edit-item-sizes-form-box">
                <p> {size} </p>
                <input type="number" min="0" max="99"
                       value={quantity[i]}
                       onChange={e => (setQuantity(i, e.target.value))}
                       onBlur={() => (setFormValue("sizesCount", quantity))}
                />
              </div>
            ))}
          </div>
          <p className="manage-items-edit-item-label"> Box # </p>
          <input type="number"
                 className="manage-items-edit-item-box-number-input"
                 autoComplete="false"
                 autoCorrect="false"
                 spellCheck="false"
                 value={boxNumber}
                 min="1"
                 max="99"
                 onChange={e => (setInput("boxNumber", e.target.value))}
                 onBlur={() => (setFormValue("boxNumber", boxNumber))}
          />
        </React.Fragment>
        <button type="submit"
                className="manage-items-edit-item-sizes-form-submit"
                onClick={e => (submitForm(e))}
        > Update </button>
      </div>
    )
  }
}

export default EditItemForm