package inventory

import (
	"../authentication"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
)
var (
	FetchColors = newFetchHandler("colors")
	FetchModels = newFetchHandler("models")
	FetchTypes = newFetchHandler("types")
	UpdateColors = newUpdateHandler("colors")
	UpdateModels = newUpdateHandler("models")
	UpdateTypes = newUpdateHandler("types")
)

func newFetchHandler(table string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		db := dbConn()
		rows, e := db.Query(`SELECT name FROM ` + table)
		if e != nil {
			log.Println(e)
		}
		defer rows.Close()
		var out []string
		for rows.Next() {
			var val string
			e := rows.Scan(&val)
			if e != nil {
				log.Println(e)
			}
			out = append(out, val)
		}
		e = rows.Err()
		if e != nil {
			log.Println(e)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		e = json.NewEncoder(w).Encode(out)
		if e != nil {
			log.Println(e)
		}
	}
}

type jsonData []string

func newUpdateHandler(table string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, e := r.Cookie("sessionId")
		if e != nil {
			return
		}
		sessionId := cookie.Value
		e = authentication.VerifySessionId(sessionId)
		if e != nil {
			return
		}
		db := dbConn()
		decoder := json.NewDecoder(r.Body)
		var data jsonData
		e = decoder.Decode(&data)
		if e != nil {
			log.Println(e)
			return
		}
		tx, e := db.Begin()
		defer tx.Commit()
		if e != nil {
			log.Fatal(e)
		}
		query := fmt.Sprintf(
			`CREATE TABLE %s_ (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);`, table,
			)
		_, e = tx.Exec(query)
		if e != nil {
			log.Fatal(e)
		}
		for _, val := range data {
			_, e = tx.Exec(
				fmt.Sprintf(
					`INSERT INTO %s_ (name) VALUES ($1);`,
					table,
					), val)
			if e != nil {
				log.Fatal(e)
			}
		}
		query = fmt.Sprintf(`DROP TABLE %s`, table)
		_, e = tx.Exec(query)
		if e != nil {
			log.Fatal(e)
		}
		query = fmt.Sprintf(`ALTER TABLE %s_ RENAME TO %s`, table, table)
		_, e = tx.Exec(query)
		if e != nil {
			log.Fatal(e)
		}
	}
}


type retrievedListing struct {
	Id string `json:"id"`
	Model string `json:"model"`
	Color string `json:"color"`
	ShoeType string `json:"type"`
	Price string `json:"price"`
	Quantity string `json:"quantity"`
	BoxNumber string `json:"boxNumber"`
	Sizes []string `json:"sizes"`
	SizesCount []string `json:"sizesCount"`
	ImageURL string `json:"imageURL"`
}

func FetchAllListings(w http.ResponseWriter, r *http.Request) {
	db := dbConn()
	s := "id, model, color, type, price, quantity, box_number, image_url"
	result := make([]retrievedListing, 0)
	query := fmt.Sprintf(
		`SELECT %s
		FROM inventory`,
		s,
		)
	rows, e := db.Query(query)
	if e != nil {
		log.Println("Fetch Listings, inventory ", e)
	}
	defer rows.Close()
	for rows.Next() {
		var current retrievedListing
		e := rows.Scan(
			&current.Id,
			&current.Model,
			&current.Color,
			&current.ShoeType,
			&current.Price,
			&current.Quantity,
			&current.BoxNumber,
			&current.ImageURL,
			)
		if e != nil {
			log.Println(e)
		}
		result = append(result, current)
	}
	s = `"34", "35", "36", "37", "38", "39", "40", "41"`
	query = fmt.Sprintf(
	   `SELECT %s FROM sizes`,
	   s,
	   )
	rows, e = db.Query(query)
	if e != nil {
		log.Println("Fetch Listings, sizes", e)
	}
	defer rows.Close()
	i := 0
	for rows.Next() {
       sizesCount := make([]string, 8)
	   dest := make([]interface{}, 8)
	   for j := range sizesCount {
	       dest[j] = &sizesCount[j]
       }
		e := rows.Scan(
           dest...,
		)
		if e != nil {
			log.Println(e)
		}
		result[i].SizesCount = sizesCount
		var sizes []string
		for i, val := range sizesCount {
			n, _ := strconv.Atoi(val)
			if n > 0 {
				sizes = append(sizes, strconv.Itoa(i + 34))
			}
		}
		result[i].Sizes = sizes
		i++
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func DeleteListing(w http.ResponseWriter, r *http.Request) {
	cookie, e := r.Cookie("sessionId")
	if e != nil {
		return
	}
	sessionId := cookie.Value
	e = authentication.VerifySessionId(sessionId)
	if e != nil {
		return
	}
	v := struct{
		Id string `json:"id"`
	}{}
	e = json.NewDecoder(r.Body).Decode(&v)
	if e != nil {
		log.Println(e)
		return
	}
	db := dbConn()
	query := `DELETE FROM inventory WHERE id = $1`
	id, e := strconv.Atoi(v.Id)
	if e != nil {
		log.Println(e)
		return
	}
	_, e = db.Exec(query, id)
	if e != nil {
		log.Println(e)
	}
	query = `DELETE FROM sizes WHERE id = $1`
	_, e = db.Exec(query, id)
	if e != nil {
		log.Println(e)
	}
	filePath := fmt.Sprintf("./inventory/images/%s.jpg", v.Id)
	e = os.Remove(filePath)
	if e != nil {
		log.Println(e)
	}
}