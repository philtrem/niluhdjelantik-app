import React, {Component} from 'react'
import './ListItems.css'
import './ListItemsLargeScreens.css'
import SizeFilter from './SizeFilter'
import FilterDropdown from "./FilterDropdown"
import PageNav from "./PageNav"

class ListItems extends Component {
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
    maxListings: 10,
    showUpdateSuccessful: false,
    currentPage: 1,
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
      this.setState({
        listings: this.initialListings
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
  updatePageNumber(n) {
    if (this.state.listings.length)
      this.setState({
        currentPage: n
      })
  }
  componentDidMount() {
    if (window.screen.width >= 800) {
      this.setState({
        maxListings: 25,
      })
    }
  	const fetchItems = this.fetchItems;
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
    const {currentPage, listings,
      maxListings} = this.state
    const lastPage = (Math.ceil(listings.length / maxListings)) || 1
    const setFilterValue = this.setFilterValue.bind(this)
    const toggleFilterCheckbox = this.toggleFilterCheckbox.bind(this)
    const toggleSize = this.toggleSize.bind(this)
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
				<p className="list-items-filters-p"> Filters: </p>
        <div className="list-items-filters-container"
        >
					<SizeFilter sizes={[34, 35, 36, 37, 38, 39, 40, 41]}
											toggleSize={toggleSize}
					/>
          <div className="list-items-filters-container-row">
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
          </div>
        </div>
        <Grid listings={listings}
              currentPage={currentPage}
              maxListings={maxListings}
        />
        {
          listings.length > 0 ? (
            <PageNav currentPage={currentPage}
                     lastPage={lastPage}
                     updatePageNumber={updatePageNumber}/>
          ) : (
            <div className="list-items-no-results">
              <p> No results to show </p>
            </div>
          )
        }

      </div>
    )
  }
}
export default ListItems

const Filter = props => {
  const {checkboxState, component, name, toggleFilterCheckbox} = props
  return (
    <div className="list-items-filter">
      <label>
        {name}
        <div className="list-items-filter-container">
          {component}
          <input className="list-items-filter-checkbox"
                 type="checkbox"
                 checked={checkboxState[name] || false}
                 onChange={() => (toggleFilterCheckbox(name))}
          />
        </div>
      </label>
    </div>
  )
}



const Grid = props => {
  const {listings, currentPage, maxListings, toggleEdit} = props
  const start = maxListings * (currentPage - 1)
  const end = maxListings * currentPage
  return (
    <div className="list-items-grid-container">
      <div className="list-items-grid">
        {
          listings.slice(start, end).map(item => (
            <Cell key={item.id} id={item.id} item={item} toggleEdit={toggleEdit}/>
          ))
        }
      </div>
    </div>
  )
}

const Cell = props => {
  const {item} = props
  if (item.price.length === 4) {
    item.price = item.price[0] + "," + item.price.slice(1)
  }
  return (
    <div className="list-items-cell-container">
      <div className="list-items-cell">
        <img src={item.imageURL} alt={item.model}/>
      </div>
			<p>
				{item.model[0].toUpperCase()
        + item.model.slice(1)} - {item.color}
			</p>
			<p className="list-items-cell-price">
        IDR {item.price},000.00
      </p>
      <div className="list-items-sizes-container">
        {
          item.sizes.map(size => (
            <div className="list-items-sizes-cell"> {size} </div>
          ))
        }
      </div>
    </div>
  )
}