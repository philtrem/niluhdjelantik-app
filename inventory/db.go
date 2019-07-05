package inventory

import (
    "os"
    "database/sql"
    "fmt"
    _ "github.com/mattn/go-sqlite3"
    "io/ioutil"
    "log"
    "mime/multipart"
    "net/http"
    "strconv"
    "strings"
)

var db *sql.DB
var e error

func dbConn() *sql.DB {
    e = os.Setenv("CGO_ENABLED", "1")
    if e != nil {
        log.Println("set env variable (cgo_enabled): ", e)
    }
    db, e = sql.Open("sqlite3", "./database/niluh-djelantik.db")
    if e != nil {
        log.Fatal("Open Database", e)
    }
    e = db.Ping()
    if e != nil {
        log.Fatal("Ping Database", e)
    }
    return db
}

type shoeListing struct {
    model       string
    color       string
    price       string // not a mistake, passed as string to SQLite
    shoeType    string
    sizesCount  string // not a mistake
    boxNumber   string
    imageFile   *multipart.File
    imageHeader *multipart.FileHeader
    imageURL    string
}

// used to name and link image files
// returns last id, used after committing a listing to the database
// * to name the file at time of writing it to disk
func getLastId() int {
    db := dbConn()
    //query := `SELECT id FROM inventory ORDER BY id DESC LIMIT 1;`
    query := `SELECT MAX(id) FROM inventory;`
    row := db.QueryRow(query)
    var id int
    e = row.Scan(&id)
    if e != nil {
        log.Println("getLastId", e)
    }
    return id
}

// returns next id for listing to be added
func NextId() int {
    return getLastId() + 1
}

//builds and returns shoeListing, then persists listing to db
func NewShoeListing(w http.ResponseWriter, r *http.Request) {
   // represents a shoe listing
   listing := shoeListing{
       model:       r.FormValue("model"),
       color:       r.FormValue("color"),
       price:       r.FormValue("price"),
       shoeType:    r.FormValue("type"),
       sizesCount:  r.FormValue("sizesCount"),
       boxNumber:   r.FormValue("boxNumber"),
   }
   imageFile, imageHeader, e := r.FormFile("image")
   if e != nil {
       //log.Println("FormFile", e)
       log.Println("No file")
   }
   // write image file to disk if filename is not an empty string
   if imageFile != nil && imageHeader.Filename != "" {
       // fetches next id to prepare filename before we commit listing to the database
       defer imageFile.Close()
       idAsString := strconv.Itoa(NextId())
       s := strings.Split(imageHeader.Filename, ".")
       fileExtension := s[len(s)-1]
       listing.imageFile = &imageFile
       listing.imageHeader = imageHeader
       listing.imageURL = "/images/" + idAsString + "." + fileExtension
   } else {
       listing.imageURL = r.FormValue("imageURL")
   }
   // persists listing to the database
   listing.persist()
}

func UpdateShoeListing(w http.ResponseWriter, r *http.Request) {
    NewShoeListing(w, r)
    id := r.FormValue("id")
    lastId := getLastId()
    db := dbConn()
    _, e := db.Exec(`DELETE FROM inventory WHERE id=$1;`, id)
    if e != nil {
       log.Fatal("UpdateShoeListing at DELETE FROM inventory", e)
    }
    _, e = db.Exec(`UPDATE inventory SET id=$1 WHERE id=$2`,
        id, lastId,
    )
    if e != nil {
        log.Fatal("UpdateShoeListing at UPDATE inventory", e)
    }
    _, e = db.Exec(`DELETE FROM sizes WHERE id=$1;`, id)
    if e != nil {
        log.Fatal("UpdateShoeListing at DELETE FROM sizes", e)
    }
    _, e = db.Exec(`UPDATE sizes SET id=$1 WHERE id=$2`,
        id, lastId,
    )
    if e != nil {
        log.Fatal("UpdateShoeListing at UPDATE sizes", e)
    }
}

// persists listing to the database
func (s shoeListing) persist() {
    db := dbConn()
    columns := "model, color, type, price, box_number, image_url"
    var query string
    query = fmt.Sprintf(
        `INSERT INTO inventory (%s) VALUES($1, $2, $3, $4, $5, $6)`,
            columns,
        )
    stmt, e := db.Prepare(query)
    if e != nil {
        log.Fatal("INSERT INTO inventory (prepare)", e)
    }
    defer stmt.Close()
    stmt.Exec(s.model, s.color, s.shoeType, s.price, s.boxNumber, s.imageURL)
    // update table sizes
    if len(s.sizesCount) > 0 {
        updateSizes(s.sizesCount, getLastId())
    }
    if s.imageFile != nil && s.imageHeader.Filename != "" {
        // reads image file
        data, e := ioutil.ReadAll(*s.imageFile)
        if e != nil {
            log.Println("Read File", e)
        }
        // writes image file to disk if filename is not an empty string
        writeImage(data)
    }
}

func updateQuantity(id int, value int) {
    db := dbConn()
    query := `UPDATE inventory
              SET quantity = $1
              WHERE id = $2;`
    stmt, e := db.Prepare(query)
    if e != nil {
        log.Fatal("Update Quantity (prepare)", e)
    }
    defer stmt.Close()
    result, e := stmt.Exec(value, id)
    if e != nil {
        log.Println("Update Quantity (exec)")
    }
    i, _ := result.RowsAffected()
    if i != 1 {
        log.Fatal("Update Quantity: rows affected != 1")
    }
}

func updateSizes(s string, id int) {
    db := dbConn()
    sizes := []int{34, 35, 36, 37, 38, 39, 40, 41}
    sizesCount := parseSizes(s)
    count := make([]int, len(sizes))
    total := 0
    if id == getLastId() {
        _, e := db.Exec(`INSERT INTO sizes (id) VALUES ($1);`, id)
        if e != nil {
            log.Fatal("UpdateSizes at INSERT ID", e)
        }
    } else {
        for i, v := range sizes {
            var val int
            rows, e := db.Query(
                fmt.Sprintf(`SELECT $1 FROM sizes WHERE ID = %d;`,
                    id), v)
            if e != nil {
                log.Fatal("UpdateSizes at LOOP 1 (reading values)", e)
            }
            for rows.Next() {
                e = rows.Scan(&val)
            }
            count[i] = val
            rows.Close()
        }
    }
    for i := 0; i < len(sizesCount); i++ {
        size := sizes[i]
        sizeCount := sizesCount[i]
        prevValue := count[i]
        newValue := prevValue + sizeCount
        total += newValue
        _, e := db.Exec(
            fmt.Sprintf(
                `UPDATE sizes SET "%d" = %d WHERE ID = %d;`, size, newValue, id,
            ),
        )
        if e != nil {
            log.Fatal("UpdateSizes at LOOP 2 (UPDATE values)", e)
        }
    }
    updateQuantity(id, total)
}

func parseSizes(s string) []int {
    toSlice := strings.Split(s, ",")
    out := make([]int, 0, len(toSlice))
    for _, v := range toSlice {
        toInt, e := strconv.Atoi(v)
        if e != nil {
            log.Println(e)
        }
        out = append(out, toInt)
    }
    return out
}
