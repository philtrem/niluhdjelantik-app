package main
import (
	"net/http"
)

func main() {
	log.fatal(http.ListenAndServe(":80", http.HandleFunc(redirect)))
}

func redirect(w http.ResponseWriter, r *http.Request) {
	destination := "https://" + r.Host + r.URL.Path
	if len(r.URL.RawQuery) > 0 {
		destination += "?" + r.URL.RawQuery
	}
	http.Redirect(w, r, destination, http.StatusTemporaryRedirect)
}
