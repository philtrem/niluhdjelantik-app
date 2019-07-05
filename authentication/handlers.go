package authentication

import (
	"encoding/json"
	"net/http"
)

type requestStatus struct {
	Successful bool `json:"successful"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	sessionId, expires, e := authenticateUser(username, password)
	if e != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(requestStatus{false})
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name: "sessionId",
		Value: sessionId,
		// DEFAULT: set to expire in 60 days
		Expires: expires,
		// Secure: true
	})
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(requestStatus{true})
}
func CheckAuthStatus(w http.ResponseWriter, r *http.Request) {
	unsuccessful := struct{
		Authenticated bool `json:"authenticated"`
	}{
		Authenticated: false,
	}
	ok := struct{
		Authenticated bool `json:"authenticated"`
	}{
		Authenticated: true,
	}
	cookie, e := r.Cookie("sessionId")
	if e != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(unsuccessful)
		return
	}
	sessionId := cookie.Value
	e = VerifySessionId(sessionId)
	if e != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(unsuccessful)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ok)
}