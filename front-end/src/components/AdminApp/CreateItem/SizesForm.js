import React, {Component} from 'react'
import './SizesForm.css'

class SizesForm extends Component {
  state = {
    toggled: {},
    selectedSizes: [],
    sizesCount: [],
    resetForm: this.props.resetForm,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.resetForm) {
      const sizes = nextProps.sizes
      const sizesCount = []
      for (let i = 0; i < sizes.length; i++) {
        sizesCount.push(0)
      }
      sizes.forEach(size => {
        const quantityInput = this.refs["quantity" + size]
        const quantityControls = this.refs["quantityControls" + size]
        quantityInput.type = "hidden"
        quantityControls.style.display = "none"
      })
      this.setState({
        toggled: {},
        selectedSizes: [],
        sizesCount,
        resetForm: false,
      })
    }
  }
  componentDidMount() {
    const {sizes} = this.props
    const {sizesCount} = this.state
    for (let i = 0; i < sizes.length; i++) {
      sizesCount.push(0)
    }
    this.setState({
      sizesCount,
    })
  }
  toggleSize(id) {
    const size = id
    const {sizes, setFormValue} = this.props
    const smallestSize = sizes[0]
    const index = size - smallestSize
    const {toggled, selectedSizes, sizesCount} = this.state
    const quantityInput = this.refs["quantity" + size]
    const quantityControls = this.refs["quantityControls" + size]

    if (toggled[size]) {
      toggled[size] = false
      quantityInput.type = "hidden"
      quantityControls.style.display = "none";
      let i = selectedSizes.indexOf(size)
      selectedSizes.splice(i, 1)
      selectedSizes.sort()
      sizesCount[index] = 0
      setFormValue("sizesCount", sizesCount)
      this.setState({
        toggled,
        selectedSizes,
        sizesCount
      })
    } else {
      toggled[size] = true
      quantityInput.type = "text"
      quantityControls.style.display = "flex";
      selectedSizes.push(size)
      selectedSizes.sort()
      sizesCount[index] = 1
      setFormValue("sizesCount", sizesCount)
      this.setState({
        toggled,
        selectedSizes,
        sizesCount
      })
    }
  }
  updateQuantity(e) {
    e.preventDefault()
    const size = e.target.id
    const {sizes, setFormValue} = this.props
    const smallestSize = sizes[0]
    const index = size - smallestSize
    let value = e.target.value
    const quantityInput = this.refs["quantity" + size]
    const {sizesCount} = this.state
    if (value === "plus") {
      let n = quantityInput.value
      n++
      sizesCount[index] = n
      setFormValue("sizesCount", sizesCount)
      this.setState({
        sizesCount,
      })
    }
    else if (value === "minus") {
      let n = quantityInput.value
      if (n > 1) {
        n--
        sizesCount[index] = n
        setFormValue("sizesCount", sizesCount)
        this.setState({
          sizesCount,
        })
      }
    }
    else {
      value = Number(value)
      if (value >= 1) {
        sizesCount[index] = value
      } else {
        sizesCount[index] = sizesCount[index]
      }
      setFormValue("sizesCount", sizesCount)
      this.setState({
        sizesCount
      })
    }
  }

  render() {
    const {sizes} = this.props
    const smallestSize = sizes[0]
    const {toggled} = this.state
    const toggleSize = this.toggleSize.bind(this)
    const updateQuantity = this.updateQuantity.bind(this)
    const {sizesCount} = this.state
    return (
      <div className="sizes-form">
        {
          sizes.map((size) => (
            <div key={size}>
              <div className={toggled[size]
                     ? "sizes-form-item toggled"
                     : "sizes-form-item" }
                   id={size}
                   onClick={(e) => toggleSize(e.target.id)}
              >
                {size}
              </div>
              <div className="sizes-form-quantity">
                <input ref={"quantity" + size} id={size} className="sizes-form-quantity-input"
                       type="hidden" value={sizesCount[size-smallestSize] || 0}
                       onChange={(e) => (updateQuantity(e))}/>
                <div ref={"quantityControls" + size} className="sizes-form-quantity-controls">
                  <button id={size} value="plus" className="sizes-form-buttons" onClick={(e) => (updateQuantity(e))}> + </button>
                  <button id={size} value="minus" className="sizes-form-buttons" onClick={(e) => (updateQuantity(e))}> - </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }
}

export default SizesForm