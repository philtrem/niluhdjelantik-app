package authentication

import (
	"database/sql"
	"log"
	"os"
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