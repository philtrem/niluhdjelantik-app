package authentication

import (
	"errors"
	"github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"log"
	"time"
)

func VerifySessionId(sessionId string) error {
	db := dbConn()
	query := `SELECT id, exp
              FROM sessions
              WHERE id = $1`
	row := db.QueryRow(query, sessionId)
	var fetchedSessionId string
	var fetchedExp int64
	e := row.Scan(&fetchedSessionId, &fetchedExp)
	if e != nil {
		return errors.New("authentication: invalid session id")
	}
	if time.Now().Unix() > fetchedExp {
		return errors.New("authentication: expired session")
	}
	return nil
}

func fetchHashedPassword (username string) (string, error) {
	db := dbConn()
	query := "SELECT password " +
		"FROM users " +
		"WHERE username = $1"
	row:= db.QueryRow(query, username)
	var hashedPassword string
	e := row.Scan(&hashedPassword)
	if e != nil {
		return "", e
	}
	return hashedPassword, nil
}

func storeSessionId(sessionId string, expiration int64) error {
	db := dbConn()
	query := "INSERT INTO sessions VALUES ($1, $2)"
	_, e = db.Exec(query, sessionId, expiration)
	if e != nil {
		return e
	}
	return nil
}

func authenticateUser(username string, password string) (string, time.Time, error) {
	hashedPassword, e := fetchHashedPassword(username)
	if e != nil {
		e := errors.New("authentication: user does not exist")
		return "", time.Now(), e
	}
	e = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if e != nil {
		return "", time.Now(), e
	}
	sessionId, e := uuid.NewV4()
	// DEFAULT: set to expire in 60 days
	expires := time.Now().Add(5184000 * time.Second)
	e = storeSessionId(sessionId.String(), expires.Unix())
	if e != nil {
		log.Println("Error storing session id")
	}
	return sessionId.String(), expires, e
}

// TEMPORARY, DEV-ONLY (to set initial user and password in table 'users')
func UpdatePassword(password string) {
	hashedPassword, e := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if e != nil {
		log.Println(e)
	}
	db := dbConn()
	query := `UPDATE users
              SET password = $1
              WHERE username = "admin"`
	_, e = db.Exec(query, string(hashedPassword))
	if e != nil {
		log.Fatal(e)
	}
}
