import React, {Component} from 'react'
import './ManageItems.css'
import SizeFilter from './SizeFilter'
import EditItemForm from "./EditItemForm"
import FilterDropdown from "./FilterDropdown"
import MessageBox from "../shared/Messages/MessageBox"
import PageNav from "./PageNav"

class ManageItems extends Component {
  initialListings = []
  state = {
    editItemData: {},
    editToggled: false,
    listings: [],
    filters: {
      color: "",
      type: "",
      sizes: "",
      checkboxes: {
        sizes: {}
      },
    },
    maxListings: 25,
    currentPage: 1,
  }
  deleteItem(id) {
    fetch("/deleteListing", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({id})
    })
    const {toggleMessageBox, updateListings} = this
    const itemData = {
      id,
      deleted: true,
    }
    updateListings.call(this, itemData)
    toggleMessageBox.call(this, "Listing permanently deleted.")
    setTimeout(toggleMessageBox.bind(this), 750)
  }
  toggleEdit(id) {
    const {listings} = this.state
    const editItemData = listings.filter(item => (
      item.id === id
    ))[0]
    this.setState(prevState => (
      {
        editToggled: !prevState.editToggled,
        editItemData
      }
    ))
  }
  toggleMessageBox(message, messageType) {
    if (messageType === undefined) {
      messageType = "none"
    }
    const messageBoxOptions = {
      message,
      messageType,
    }
    this.setState(prevState => ({
      messageBoxEnabled: !prevState.messageBoxEnabled,
      messageBoxOptions,
    }))
  }
  setFilterValue(key, value) {
    const {filters} = this.state
    const {checkboxes} = filters
    if (!checkboxes[key]) {
      checkboxes[key] = true
    }
		if (value) {
			filters[key] = value
		}
    this.setState({
      currentPage: 1,
      filters
    }, this.filterListings.bind(this))
  }
  toggleFilterCheckbox(key) {
    const {filters} = this.state
    const {checkboxes} = filters
    checkboxes[key] = !checkboxes[key]
    this.setState({
      currentPage: 1,
      filters
    }, this.filterListings.bind(this))
  }
  toggleSize(target) {
    const size = target.id
    const {checkboxes} = this.state.filters
    let className = target.className
    if (className.includes("toggled")) {
      className = className.split(" ")[0]
    } else {
      className += " toggled"
    }
    target.className = className
    checkboxes.sizes[size] = !checkboxes.sizes[size]
    this.setState({
      checkboxes
    }, this.filterListings.bind(this))
  }
  filterListings() {
    const listings = this.initialListings
    const {filters, maxListings} = this.state
    const {checkboxes} = filters
    let activeFilters = []
    Object.keys(filters).forEach(key => {
      if (key === "sizes") {
        let isActive = false
        Object.keys(checkboxes[key]).forEach(k => {
          if (checkboxes[key][k]) {
            isActive = true
          }
        })
        isActive && activeFilters.push(key)
      } else {
        checkboxes[key] && activeFilters.push(key)
      }
    })
    if (activeFilters.length === 0) {
      const listings = this.initialListings
      const lastPage = (Math.ceil(listings.length / maxListings)) || 1
      let currentPage = this.state.currentPage
      currentPage > lastPage && currentPage--
      this.setState({
        currentPage,
        lastPage,
        listings,
      })
      return
    }
    const activeSizes = Object.keys(checkboxes["sizes"]).filter(size => {
      return checkboxes["sizes"][size]
    })
    let result = listings.filter(item => {
      let isIncluded = true
      activeFilters.forEach(key => {
        if (key === "sizes") {
          const sizes = item.sizes || []
          let sizeMatch = false
          activeSizes.forEach(size => {
            if (sizes.includes(size)) {
              sizeMatch = true
            }
          })
          if (!sizeMatch) {
            isIncluded = false
          }
        } else {
          if (item[key] !== filters[key]) {
            isIncluded = false
          }
        }
      })
      return isIncluded
    })
    const lastPage = (Math.ceil(result.length / maxListings)) || 1
    let currentPage = this.state.currentPage
    currentPage > lastPage && currentPage--
    this.setState({
      currentPage,
      lastPage,
      listings: result,
    })
  }
  updateListings(itemData) {
    let listings = this.initialListings
    if (itemData.deleted) {
      listings = Object.values(listings).filter(item => {
        return item.id !== itemData.id;
      })
    } else {
      listings = Object.values(listings).map(item => {
        if (item.id === itemData.id) {
          return itemData
        } else {
          return item
        }
      })
    }
    this.initialListings = listings
    this.filterListings.call(this)
  }
  updatePageNumber(n) {
    if (this.state.listings.length)
      this.setState({
        currentPage: n
      })
  }
  componentDidMount() {
    const {fetchItems} = this.props; // semi-colon required
    ["colors", "types"].forEach(field => {
      fetchItems(field)
        .then(json => {
          if (json) {
            const {filters} = this.state
            filters[field.slice(0, -1)] = json[0] || ""
            this.setState({
              [field]: json || [],
              filters
            })
          }
        })
    })
    fetch("/fetchAll")
      .then(res => (
        res.json()
      ))
      .then(json => {
        this.initialListings = json
        this.setState({
          listings: json
        })
      })
      .catch(error => {
        console.log("Fetch error", error)
      })
  }
  render() {
    const {colors, types} = this.state
    const {currentPage, editItemData, editToggled, listings, maxListings, messageBoxEnabled, messageBoxOptions} = this.state
    const lastPage = (Math.ceil(listings.length / maxListings)) || 1
    const deleteItem = this.deleteItem.bind(this)
    const toggleEdit = this.toggleEdit.bind(this)
    const toggleMessageBox = this.toggleMessageBox.bind(this)
    const setFilterValue = this.setFilterValue.bind(this)
    const toggleFilterCheckbox = this.toggleFilterCheckbox.bind(this)
    const toggleSize = this.toggleSize.bind(this)
    const updateListings = this.updateListings.bind(this)
    const updatePageNumber = this.updatePageNumber.bind(this)
    const colorDropdown =
      <FilterDropdown key="color" name="color" values={colors || []}
                      setFilterValue={setFilterValue}
    />
    const typeDropdown =
      <FilterDropdown key="type" name="type" values={types || []}
                      setFilterValue={setFilterValue}
      />
    const components = [typeDropdown, colorDropdown]
    return (
      <div>
        { editToggled && <EditItemForm
          itemData={editItemData}
          colors={colors}
          types={types}
          toggleEdit={toggleEdit}
          toggleMessageBox={toggleMessageBox}
          updateListings={updateListings}/>
        }
        {
          messageBoxEnabled && <MessageBox options={messageBoxOptions}/>
        }
        <div className="manage-items-filters-container"
        >
          <p> Filter results: </p>
          {
            components.map(component => (
              <Filter key={component.key}
                      name={component.key}
                      component={component}
                      checkboxState={this.state.filters.checkboxes}
                      toggleFilterCheckbox={toggleFilterCheckbox}
              />
            ))
          }
          <SizeFilter sizes={[34, 35, 36, 37, 38, 39, 40, 41]}
                      toggleSize={toggleSize}
          />
          {/*<div className="manage-items-filter-price">*/}
            {/*<p> Price </p>*/}
            {/*<div>*/}
              {/*<p> min: </p> <input type="number" min="0" max="9999"/>*/}
              {/*<p> max: </p> <input type="number" min="0" max="9999"/>*/}
            {/*</div>*/}
          {/*</div>*/}
        </div>
        <Grid listings={listings}
              currentPage={currentPage}
              maxListings={maxListings}
              toggleEdit={toggleEdit}
              deleteItem={deleteItem}
        />
        {
          listings.length > 0 ? (
            <PageNav currentPage={currentPage}
                     lastPage={lastPage}
                     updatePageNumber={updatePageNumber}/>
          ) : (
            <div className="manage-items-no-results">
              <p> No results to show </p>
            </div>
          )
        }

      </div>
    )
  }
}
export default ManageItems

const Filter = props => {
  const {checkboxState, component, name, toggleFilterCheckbox} = props
  return (
    <div className="manage-items-filter">
      <label>
        {name}
        <div className="manage-items-filter-container">
          {component}
          <input type="checkbox"
                 checked={checkboxState[name] || false}
                 onChange={() => (toggleFilterCheckbox(name))}
          />
        </div>
      </label>
    </div>
  )
}



const Grid = props => {
  const {listings, currentPage, maxListings, deleteItem, toggleEdit} = props
  const start = maxListings * (currentPage - 1)
  const end = maxListings * currentPage
  return (
    <div className="manage-items-grid-container">
      <div className="manage-items-grid">
        {
          listings.slice(start, end).map(item => (
            <Cell key={item.id} id={item.id} item={item} toggleEdit={toggleEdit} deleteItem={deleteItem}/>
          ))
        }
      </div>
    </div>
  )
}

const Cell = props => {
  const {id, item, deleteItem, toggleEdit} = props
	if (item.price.length === 4) {
		item.price = item.price[0] + "," + item.price.slice(1)
	}
  const hoverLabel = React.createRef()
  const deleteButton = React.createRef()
  const deleteDialog = React.createRef()
  return (
    <div className="manage-items-cell-container"
         onMouseOver={
           () => {
             hoverLabel.current.className += " toggled"
             deleteButton.current.className += " toggled"
           }
         }
         onMouseOut={
           () => {
             let className = hoverLabel.current.className
             hoverLabel.current.className = className.replace(" toggled", "")
             className = deleteButton.current.className
             deleteButton.current.className = className.replace(" toggled", "")
           }
         }
         onClick={e => {
           const excluded = ["xijq"] // random strings
           if (excluded.includes(e.target.className.substring(0,4))) {
             return
           }
           const isDeleteDialogToggled = deleteDialog.current.className.includes("toggled")
           if (isDeleteDialogToggled) {
             return
           }
           toggleEdit(id)
         }}
    >
      <DeleteDialog id={id} ref={deleteDialog} deleteItem={deleteItem}/>
      <div className="manage-items-cell-top">
        <div className="xijq manage-items-cell-delete-button"
             onClick={() => {
               deleteDialog.current.className += " toggled"
             }}
             ref={deleteButton}
        > <span className="xijq"> x </span> </div>
      </div>

      <p> Box #: {item.boxNumber} </p>
      <p className="manage-items-cell-model">
        {item.model[0].toUpperCase()
        + item.model.slice(1)} - {item.color}
      </p>
      <p className="manage-items-cell-price">
        IDR {item.price},000.00
      </p>
      <div className="manage-items-cell">
        <div className="manage-items-cell-hover-label"
             ref={hoverLabel}
        >
          <p> Click to Edit </p>
        </div>
        <img src={item.imageURL} alt={item.model}/>
      </div>
      <div>

      </div>
    </div>
  )
}

const DeleteDialog = React.forwardRef((props, ref) => {
  const deleteDialog = ref
  const {deleteItem, id} = props
  return (
    <div>
      <div className="manage-items-cell-delete-dialog"
           ref={deleteDialog}
      >
        <p> Are you sure you want to delete this listing ? </p>
        <button id={id}
                className="xijq manage-items-cell-delete-dialog-buttons"
                onClick={e => {
                  const className = deleteDialog.current.className
                  deleteDialog.current.className = className.replace(" toggled", "")
                  deleteItem(e.target.id)
                }}
        > yes </button>
        <button className="xijq manage-items-cell-delete-dialog-buttons"
                onClick={() => {
                  const className = deleteDialog.current.className
                  deleteDialog.current.className = className.replace(" toggled", "")
                }}
        > no </button>
      </div>
    </div>
  )
})