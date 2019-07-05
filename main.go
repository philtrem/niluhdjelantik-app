package main

import (
	"./authentication"
	"./inventory"
	"log"
	"net/http"
)

func main() {
	// routing + server instantiation
	http.Handle(
		"/images/",
		http.StripPrefix(
			("/images/"),
			http.FileServer(http.Dir("./inventory/images/")),
			),
		)
	http.Handle(
		"/admin/",
		http.StripPrefix(
			("/admin/"),
			http.FileServer(http.Dir("./front-end/build/")),
		),
	)
	http.Handle(
		"/app/",
		http.StripPrefix(
			("/app/"),
			http.FileServer(http.Dir("./front-end/build/")),
		),
	)
	http.Handle("/", http.FileServer(http.Dir("./front-end/build/")))
	http.HandleFunc("/checkAuthStatus/", authentication.CheckAuthStatus)
	http.HandleFunc("/login", authentication.Login)
	http.HandleFunc("/createItem", inventory.NewShoeListing)
	http.HandleFunc("/updateItem", inventory.UpdateShoeListing)
	http.HandleFunc("/models.json", inventory.FetchModels)
	http.HandleFunc("/colors.json", inventory.FetchColors)
	http.HandleFunc("/types.json", inventory.FetchTypes)
	http.HandleFunc("/update/colors/", inventory.UpdateColors)
	http.HandleFunc("/update/models/", inventory.UpdateModels)
	http.HandleFunc("/update/types/", inventory.UpdateTypes)
	http.HandleFunc("/fetchAll", inventory.FetchAllListings)
	http.HandleFunc("/deleteListing", inventory.DeleteListing)
	go http.ListenAndServe(":80", http.HandlerFunc(redirect))
	log.Fatal(http.ListenAndServeTLS(":443", "./cert/fullchain.pem", "./cert/privkey.pem", nil))
	//http.ListenAndServe(":8080", nil)
}

func redirect(w http.ResponseWriter, r *http.Request) {
	url := "https://" + r.Host + r.URL.Path
	if len(r.URL.RawQuery) > 0 {
		url += "?" + r.URL.RawQuery
	}
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}




