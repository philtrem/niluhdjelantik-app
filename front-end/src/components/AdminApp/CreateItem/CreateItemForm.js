// todo: select next LI element from suggestions on DOWN ARROW KEY press

import React, {Component} from 'react'
import EditDialog from './EditDialog'
import SizesForm from './SizesForm'
import AddImage from '../shared/AddImage'
import Dropdown from '../shared/Dropdown'
import './CreateItemForm.css'

class CreateItemForm extends Component {
  state = {
    colors: [],
    models: [],
    types: [],
    formInput: {},
    formData: {},
    editDialogToggled: [false, null],
    resetSizesForm: false,
    submitDisabled: false,
  }
  withinSuggestionBox = false
  isPriceValid(price) {
		if (price === "" ) {
		  return true
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
    switch(field) {
      case "model":
        this.setState(prevState => (
          prevState.formInput.model = value
        ))
        break
      case "color":
        this.setState(prevState => (
          prevState.formInput.color = value
        ))
        break
      case "price":
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
            this.setState(prevState => (
              prevState.formInput.price = value
            ))
          }
        break
      case "boxNumber":
        if (value >= 1 || value === "") {
          this.setState(prevState => (
            prevState.formInput.boxNumber = value
          ))
        }
        break
      default:
        // do nothing
    }
  }
  clearSuggestions(field) {
    this.withinSuggestionBox = false
    switch(field) {
      case "model":
        this.setState({
          modelSuggestions: [],
        })
        break
      case "color":
        this.setState({
          colorSuggestions: [],
        })
    }
  }
  getSuggestions(field, value) {
    let items = this.state[field + "s"]

    if (value.length === 0) {
      this.clearSuggestions(field)
      return
    }

    const onLiClick = this.onLiClick.bind(this)
    const matches = items.filter(elem => (
        elem.toLowerCase().startsWith(value.toLowerCase())
      ))
    matches.sort()
    const result = matches.map(elem => (
      <li className="suggestions-list-item" key={elem} id={elem}
        onClick={(e) => {
            onLiClick(field, e.target.id)
          }
        }
      > {elem}
      </li>
    ))
    switch(field) {
      case "model":
        this.setState({
          modelSuggestions: result
        })
        break
      case "color":
        this.setState({
          colorSuggestions: result
        })
        break
      default:
      // do nothing
    }
  }
  onInputChange(field, value) {
    if (["model", "color"].includes(field)) {
      this.setInput(field, value)
      this.getSuggestions(field, value)
    }
    else {
      this.setInput(field, value)
    }
  }
  onLiClick(field, value) {
    const setInput = this.setInput.bind(this)
    setInput(field, value)
    this.setFormValue(field, value)
    this.clearSuggestions(field)
  }
  showEditDialog(e, field) {
    e.preventDefault()
    const {editDialogToggled} = this.state
    if (editDialogToggled[0]) {
      return
    }
    editDialogToggled[0] = true
    editDialogToggled[1] = field
    this.setState({
      editDialogToggled
    })
  }
  hideEditDialog() {
    const {editDialogToggled} = this.state
    editDialogToggled[0] = false
    editDialogToggled[1] = null
    this.setState({
      editDialogToggled
    })
  }
  updateState(key, value) {
    this.setState({
      [key]: value
    })
  }
  toggleImageDialog(e) {
    e.preventDefault()
    this.setState({
      addImageToggled: !this.state.addImageToggled,
      submitDisabled: !this.state.submitDisabled,
    })
  }
  setFormValue(field, value) {
    if (field) {
      const {formData} = this.state
      formData[field] = value
      this.setState({
        formData
      })
    }
  }
  validatePrice() {
    const price = this.state.formData.price
    if (price === undefined || "") {
      return false
    }
    return true
  }
  validateForm() {
    const formData = this.state.formData
    const required = ["model", "color", "type",
      "price", "sizesCount", "boxNumber", "image"]
		const items = ["models", "colors", "types"];
		for (let i = 0; i < items.length; i++) {
			let item = items[i]
			let item_ = item.slice(0, -1)
			if (!this.state[item].includes(formData[item_])) {
				return [false, `must first add ${item_} to ${item_} bank through edit menu`]
			}
		}
    for (let i = 0; i < required.length; i++) {
      const key = required[i]
      if (!formData[key]) {
        if (key === "image") {
          return [false, "missing an image"]
        }
        return [false, "missing field"]
      }
    }
		if (!this.validatePrice()) {
			return [false, "invalid price"]
		}
    return [true, ""]
  }
  submitForm(e) {
    e.preventDefault()
    const validateResult = this.validateForm()
    if (!validateResult[0]) {
      this.setState({
        message: validateResult[1],
        showMessage: true,
      })
      return
    }
    let form = new FormData()
    const formData = this.state.formData
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key])
    })
    // fetch("/createItem", {
    //   method: "POST",
    //   body: form,
    //   headers: {"Content-Type": "multipart/form-data"}
    // })
    const request = new XMLHttpRequest()
    request.open("POST", "/createItem")
    request.send(form)
    const toggleMessageBox = this.props.toggleMessageBox
    toggleMessageBox()
    this.setState({
      submitDisabled: true,
    })
    setTimeout(() => {
      toggleMessageBox()
      this.setState({
        submitDisabled: false,
        formInput: {
          model: "",
          color: "",
          price: "",
          boxNumber: "",
        },
        formData: {
          type: this.state.types[0] || "",
        },
        resetSizesForm: true,
        showMessage: false,
      }, () => {
        this.setState({
          resetSizesForm: false,
        })
      })
    }, 750)
  }
  componentDidMount() {
    const {fetchItems} = this.props; // semi-colon required
    ["models", "colors", "types"].forEach(field => {
      fetchItems(field)
        .then(json => {
          this.setState({
            [field]: json || []
          }, () => {
            if (field === "types") {
              const {formData} = this.state
              formData["type"] = this.state.types[0] || ""
              this.setState({
                formData
              })
            }
          })
        })
        .catch(error => {
          console.log(`Json error: ${error}`)
        })
    })
  }
  render() {
    const onInputChange = this.onInputChange.bind(this)
    const clearSuggestions = this.clearSuggestions.bind(this)
    const showEditDialog = this.showEditDialog.bind(this)
    const hideEditDialog = this.hideEditDialog.bind(this)
    const toggleImageDialog = this.toggleImageDialog.bind(this)
    const updateState = this.updateState.bind(this)
    const setFormValue = this.setFormValue.bind(this)
    const submitForm = this.submitForm.bind(this)
    const {
      colorSuggestions, modelSuggestions, colors, models,
      types, editDialogToggled, addImageToggled, message,
      resetSizesForm, showMessage, submitDisabled} = this.state
    const {model, color, price, boxNumber} = this.state.formInput
    return (
      <div className="create-item-form">
        <form
          className="item-form"
          action="/createItem"
          method="post"
          encType="multipart/form-data"
          autoCorrect="false"
          autoComplete="off"
        >
          <div>
            <p> Model </p>
            <div className="input-row">
              <input type="text"
                     value={model}
										 autoComplete="false"
										 autoCorrect="false"
                     spellCheck="false"
                     onChange={(e) => {
                       onInputChange("model", e.target.value)
                       setFormValue("model", e.target.value)
                     }}
                     onBlur={e => {
                       if (this.withinSuggestionBox) {
                         return
                       }
                       clearSuggestions("model", e)
                     }}
              />
              <button className="edit-button" id="edit-models"
                      onClick={(e) => (showEditDialog(e, "model"))}
              > Edit </button>
              <div>
              {
                editDialogToggled[0] && <EditDialog
                  selected={editDialogToggled[1]}
                  items={this.state[editDialogToggled[1] + "s"]}
                  updateState={updateState}
                  hideEditDialog={hideEditDialog}
                />
              }
              </div>
            </div>
            <div className="auto-complete" id="model"
                 onMouseEnter={() => {
                   this.withinSuggestionBox = true
                 }}
                 onMouseLeave={() => {
                   this.withinSuggestionBox = false
                 }}
            >
              <ul className="suggestions-list">
                {modelSuggestions}
              </ul>
            </div>
          </div>
          <div>
            <p> Color </p>
            <div className="input-row">
              <input type="text"
                     value={color}
										 autoComplete="false"
										 autoCorrect="false"
                     spellCheck="false"
                     onChange={
                       e => {
                         onInputChange("color", e.target.value)
                         setFormValue("color", e.target.value)
                       }}
                     onBlur={e => {
                       if (this.withinSuggestionBox) {
                         return
                       }
                       clearSuggestions("color", e)
                     }}
              />
              <button className="edit-button" id="edit-colors"
                      onClick={(e) => (showEditDialog(e, "color"))}
              > Edit </button>
            </div>
            <div className="auto-complete" id="color"
                 onMouseEnter={() => {
                   this.withinSuggestionBox = true
                 }}
                 onMouseLeave={() => {
                   this.withinSuggestionBox = false
                 }}
            >
              <ul className="suggestions-list">
                {colorSuggestions}
              </ul>
            </div>
          </div>
          <p> Price </p>
          <div className="create-item-form-price-row">
						<p className="create-item-form-price-affix"> IDR </p>
            <input className="create-item-form-price-input"
									 type="text"
									 value={price || ""}
									 autoComplete="false"
									 autoCorrect="false"
									 spellCheck="false"
									 onChange={e => {
									   onInputChange("price", e.target.value)
                     setFormValue("price", e.target.value)
                   }}
						/>
            <p className="create-item-form-price-affix"> ,000.00 </p>
          </div>
          <p> Type </p>
          <div className="input-row type-dropdown">
            <Dropdown field="type" values={types} setFormValue={setFormValue}/>
            <button className="edit-button" id="edit-types"
                    onClick={(e) => (showEditDialog(e, "type"))}
            > Edit </button>
          </div>
          <p> Sizes </p>
          <SizesForm sizes={[34, 35, 36, 37, 38, 39, 40, 41]}
                     setFormValue={setFormValue}
                     resetForm={resetSizesForm}
          />
          <p> Box # </p>
          <input className="box-number-input"
                 type="text"
								 autoComplete="false"
								 autoCorrect="false"
                 spellCheck="false"
                 value={boxNumber || ""}
                 onChange={e => {
                   onInputChange("boxNumber", e.target.value)
                   setFormValue("boxNumber", e.target.value)
                 }}
          />
          <p id="p-image"> Image </p>
          <button className="create-item-form-attach-image-button"
                  onClick={e => {toggleImageDialog(e)}}
          > Attach image </button>
          {
            addImageToggled &&
            <AddImage toggleImageDialog={toggleImageDialog}
                      setFormValue={setFormValue}
            />
          }
          <div className="create-item-form-separator">
          </div>
          {
            showMessage &&
            <p className="create-item-form-message"> {message} </p>
          }
          <button className="create-item-form-submit"
                  ref="submit"
                  type="submit"
                  disabled={submitDisabled}
                  onClick={e => (submitForm(e))}
          > Submit </button>
        </form>
      </div>
    )
  }
}

export default CreateItemForm